import {
  Controller,
  Get,
  Inject,
  LoggerService,
  StreamableFile,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import axios from 'axios';
import { Buffer } from 'buffer';
import { constants } from 'http2';
import { JSDOM } from 'jsdom';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

import { AppCacheService } from '../../cache/service';

type Event = {
  title: string;
  start: Date;
  end: Date;
  link: string;
};

@ApiTags('Calendar')
@Controller('calendar')
export class CalendarController {
  static cacheTTL = 60 * 60;
  static cacheKey = 'events';
  static cacheKeyICal = 'events.ics';

  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
    private readonly cacheService: AppCacheService,
  ) {}

  async getHackathons() {
    const response = await axios.get<string>('https://gitcoin.co/hackathons', {
      responseType: 'text',
    });
    if (response.status !== constants.HTTP_STATUS_OK) {
      this.logger.error(`Get calendar error: ${response.statusText}`);
      return undefined;
    }

    const dom = new JSDOM(response.data);
    const current = dom.window.document.querySelectorAll(
      '.hackathon-list.current .card-body',
    );
    const upcoming = dom.window.document.querySelectorAll(
      '.hackathon-list.upcoming .card-body',
    );

    const hackathons: (Event | null)[] = Array.from(current)
      .concat(Array.from(upcoming))
      .map((x: Element) => {
        const times = x.querySelectorAll(':scope .title-and-dates time');
        const titleAndDate = x.querySelector(':scope .title-and-dates h4 a');
        const title = titleAndDate?.textContent?.trim();
        const href = (titleAndDate as HTMLLinkElement)?.href?.trim();
        if (times.length !== 2 || !title || !href) {
          return null;
        }
        const start = (times[0] as HTMLTimeElement).dateTime;
        const end = (times[1] as HTMLTimeElement).dateTime;
        const link = 'https://gitcoin.co' + new URL(href).pathname;
        return {
          title,
          link,
          start: new Date(start),
          end: new Date(end),
        };
      });
    return hackathons.filter((x) => x !== null) as Event[];
  }

  @Get()
  @ApiOperation({
    summary: 'Get calendar',
  })
  async getCalendar(): Promise<Event[] | undefined> {
    let events;
    try {
      const x = await this.cacheService.get<string>(
        CalendarController.cacheKey,
      );
      events = JSON.parse(x);
    } catch (_) {
      const events = this.getHackathons();
      if (!events) {
        return undefined;
      }
      await this.cacheService.set(
        CalendarController.cacheKey,
        JSON.stringify(events),
        CalendarController.cacheTTL,
      );
    }
    return events;
  }

  @Get('/cal.ics')
  @ApiOperation({
    summary: 'Get calendar in icalendar format',
  })
  async getICal(): Promise<StreamableFile | undefined> {
    let ics;
    try {
      ics = await this.cacheService.get<string>(
        CalendarController.cacheKeyICal,
      );
    } catch (_) {}
    if (!ics) {
      const events = await this.getHackathons();
      if (!events) {
        return undefined;
      }
      ics = JSON.stringify(events);
      await this.cacheService.set(
        CalendarController.cacheKey,
        ics,
        CalendarController.cacheTTL,
      );
    }
    return new StreamableFile(Buffer.from(ics));
  }
}
