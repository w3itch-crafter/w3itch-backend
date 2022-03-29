import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import assert from 'assert';
import {
  WinstonModuleOptions,
  WinstonModuleOptionsFactory,
} from 'nest-winston';
import { config, format, transports } from 'winston';
import LokiTransport from 'winston-loki';
import TransportStream from 'winston-transport';

import { ConfigKeyNotFoundException } from '../exceptions';

const defaultLogFormat = (appName: string) =>
  format.combine(
    format.label({ label: appName }),
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.ms(),
    format.errors({ stack: true }),
    format.splat(),
  );
const consoleLogFormat = format.printf((info) => {
  const { level, timestamp, label, message, metadata } = info;
  const ctx = metadata.context;
  const ms = metadata.ms;
  const stack = metadata.stack;
  const pid = metadata?.runtime?.pid || '';
  return `\x1B[32m[${label}] ${pid}  -\x1B[39m ${timestamp}     ${level} \x1B[33m[${ctx}]\x1B[39m ${message} \x1B[33m${ms}\x1B[39m${
    stack ? '\n\x1B[31m' + stack + '\x1B[39m' : ''
  } `;
});

@Injectable()
export class WinstonConfigService implements WinstonModuleOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  async createWinstonModuleOptions(): Promise<WinstonModuleOptions> {
    const appName = this.configService.get<string>('app.name');
    const level = process.env.NODE_ENV === 'production' ? 'info' : 'debug';
    const logDir = `/var/log/${appName.toLowerCase()}`;
    const enableLoki = this.configService.get<boolean>(
      'logger.loki.enable',
      false,
    );

    const enabledTransports: TransportStream[] = [
      new transports.Console({
        format: format.combine(
          format.colorize({ all: true }),
          format.timestamp({ format: 'MM/DD/YYYY, hh:mm:ss A' }),
          format.metadata({
            fillExcept: ['label', 'timestamp', 'level', 'message'],
          }),
          consoleLogFormat,
        ),
        handleExceptions: true,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        handleRejections: true,
      }),
      new transports.File({
        filename: `${logDir}/${level}-${Date.now()}.log`,
        format: format.combine(format.json()),
      }),
      new transports.File({
        level: 'error',
        filename: `${logDir}/error-${Date.now()}.log`,
        format: format.combine(format.json()),
        handleExceptions: true,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        handleRejections: true,
      }),
    ];

    if (enableLoki) {
      const lokiUrl = this.configService.get<string>('logger.loki.url');
      assert(lokiUrl, new ConfigKeyNotFoundException('logger.loki.url'));
      const lokiTransport: TransportStream = new LokiTransport({
        level: 'silly',
        json: true,
        labels: { job: appName },
        format: format.combine(
          format.timestamp({ format: 'isoDateTime' }),
          format.json(),
        ),
        host: lokiUrl,
        handleExceptions: true,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        handleRejections: true,
        replaceTimestamp: true,
      });
      enabledTransports.push(lokiTransport);
    }

    return {
      levels: config.npm.levels,
      level,
      format: defaultLogFormat(appName),
      defaultMeta: {
        runtime: {
          pid: process.pid,
          platform: process.platform,
          node: process.versions.node,
          v8: process.versions.v8,
        },
        version: process.env.npm_package_version,
      },
      transports: [...enabledTransports],
      exitOnError: false,
    };
  }
}
