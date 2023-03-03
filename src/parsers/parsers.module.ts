import { Module } from '@nestjs/common';
import { DouParserService } from './dou.service';
import { BrowserModule } from '../browser/browser.module';

@Module({
  imports: [BrowserModule],
  providers: [DouParserService],
  exports: [DouParserService],
})
export class ParsersModule {}
