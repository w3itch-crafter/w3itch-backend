import { Module } from '@nestjs/common';

import { AppCacheModule } from '../../cache/module';
import { CalendarController } from './calendar.controller';

@Module({
  imports: [AppCacheModule],
  controllers: [CalendarController],
})
export class CalendarModule {}
