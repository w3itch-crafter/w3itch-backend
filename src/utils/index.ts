import { ConfigGetOptions } from '@nestjs/config';
import assert from 'assert';
import { isISO8601 } from 'class-validator';
import han from 'han';
import process from 'process';

import { ConfigKeyNotFoundException } from '../exceptions';

export function iso8601ToDate(date: string | Date): Date {
  if (date instanceof Date) {
    return date;
  }
  if (typeof date === 'string' && isISO8601(date)) {
    return new Date(date);
  }
  return new Date(Date.now());
}

export function decodeData(
  encoding: string,
  data: string,
): { encoding: 'utf-8'; content: string } {
  if (encoding === 'base64') {
    const buff = Buffer.from(data, 'base64');
    const decode = buff.toString('utf-8');
    return {
      encoding: 'utf-8',
      content: decode,
    };
  }
  throw new Error(`Unknown encoding type ${encoding}`);
}

export function processTitleWithHan(title: string): string {
  return han.letter(title, '-');
}

export function stringSlice(str: string, start: number, end: number): string {
  return `${str.slice(0, start)}...${str.slice(~end)}`;
}

export function isDevelopment(): boolean {
  return process.env.NODE_ENV !== 'production';
}

export function isEmptyObj(obj: object): boolean {
  assert(obj, new TypeError('parameter "obj" is required!'));
  return obj && Object.keys(obj).length === 0 && obj.constructor === Object;
}

export function assertConfig(value: unknown, key: string): void {
  assert(value, new ConfigKeyNotFoundException(key));
}

export const InferOn: ConfigGetOptions = { infer: true };
