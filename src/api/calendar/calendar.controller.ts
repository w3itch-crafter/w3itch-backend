import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  LoggerService,
  StreamableFile,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import axios from 'axios';
import { Buffer } from 'buffer';
import { constants } from 'http2';
import * as ICAL from 'ical.js';
import { JSDOM } from 'jsdom';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

import { AppCacheService } from '../../cache/service';

@ApiTags('Calendar')
@Controller('calendar')
export class CalendarController {
  static cacheTTL = 60 * 3;
  static cacheKey = 'events';

  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
    private readonly cacheService: AppCacheService,
  ) {}

  async getHackathons() {
    const url = 'https://gitcoin.co/hackathons';
    const response = await axios.get<string>(url, {
      responseType: 'text',
    });
    if (response.status !== constants.HTTP_STATUS_OK) {
      this.logger.error(`Get calendar error: ${response.statusText}`);
      return undefined;
    }
    if (/recaptcha/.exec(response.data)) {
      this.logger.warn(
        `Need to enter verification code: ${url}`,
        CalendarController.name,
      );
      return undefined;
    }

    const dom = new JSDOM(response.data);
    const current = dom.window.document.querySelectorAll(
      '.hackathon-list.current .card-body',
    );
    const upcoming = dom.window.document.querySelectorAll(
      '.hackathon-list.upcoming .card-body',
    );
    const events = Array.from(current).concat(Array.from(upcoming));

    const comp = new ICAL.Component(['vcalendar', [], []]);
    comp.updatePropertyWithValue('prodid', '-//iCal.js w3itch');
    events.forEach((x: Element) => {
      const times = x.querySelectorAll(':scope .title-and-dates time');
      const titleAndDate = x.querySelector(':scope .title-and-dates h4 a');
      const title = titleAndDate?.textContent?.trim();
      const href = (titleAndDate as HTMLLinkElement)?.href?.trim();
      if (times.length !== 2 || !title || !href) {
        return;
      }
      const start = (times[0] as HTMLTimeElement).dateTime;
      const end = (times[1] as HTMLTimeElement).dateTime;
      const link =
        'https://gitcoin.co' +
        (href.startsWith('http') ? new URL(href).pathname : href);

      const vevent = new ICAL.Component('vevent');
      const event = new ICAL.Event(vevent);
      // event.uid = ``;
      event.summary = title;
      event.startDate = ICAL.Time.fromJSDate(new Date(start));
      event.endDate = ICAL.Time.fromJSDate(new Date(end));
      vevent.addPropertyWithValue('x-link', link);
      comp.addSubcomponent(vevent);
    });
    return comp;
  }

  @Get('/cal.ics')
  @ApiOperation({
    summary: 'Get calendar in icalendar format',
  })
  async getICal(): Promise<StreamableFile | undefined> {
    const ics = await this.cacheService.lazyGet(
      CalendarController.cacheKey,
      async () => {
        const comp = await this.getHackathons();
        if (!comp) {
          throw new HttpException('', HttpStatus.NOT_FOUND);
        }
        return comp.toString();
      },
      CalendarController.cacheTTL,
    );
    return new StreamableFile(Buffer.from(ics));
  }
}
