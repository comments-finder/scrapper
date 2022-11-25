import {Inject, Module} from '@nestjs/common';
import puppeteer, {Browser} from 'puppeteer';

export const BROWSER = 'browser';

@Module({
  exports: [BROWSER],
  providers: [{
    provide: BROWSER,
    useFactory: async () => {
      const browser = await puppeteer.launch({
        headless: true,
        args: [
          '--shm-size=3gb',
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-web-security',
        ]
      });

      return browser;
    },
  }],
})
export class BrowserModule {
  constructor(@Inject(BROWSER) private readonly browser: Browser) {}
  async onApplicationShutdown(signal: string) {
    const pages = await this.browser.pages();

    await Promise.all(pages.map(page => page.close()));

    await this.browser.close();
  }
}
