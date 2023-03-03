import { Inject, Module } from '@nestjs/common';
import puppeteer from 'puppeteer-extra';
import { Browser, executablePath } from 'puppeteer';
import { ZENROWS_KEY } from '../config';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

export const BROWSER = 'browser';

@Module({
  exports: [BROWSER],
  providers: [
    {
      provide: BROWSER,
      useFactory: async () => {
        puppeteer.use(StealthPlugin());

        const browser = await puppeteer.launch({
          headless: true,
          executablePath: executablePath(),
          ignoreHTTPSErrors: true,
          args: [
            '--shm-size=3gb',
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-web-security',
            '--start-maximized',
            // `--proxy-server=${oldProxyUrl}`,
          ],
        });

        const newPageOrig = browser.newPage;

        const enrichBrowser = Object.assign(browser, {
          newPage: async () => {
            const page = await newPageOrig.call(browser);

            const gotoOrig = page.goto;

            return Object.assign(page, {
              goto: async (url: string) => {
                await gotoOrig.call(
                  page,
                  `https://api.zenrows.com/v1/?apikey=${ZENROWS_KEY}&url=${encodeURIComponent(
                    url,
                  )}`,
                );

                const pre = await page.$('pre');

                const content = await pre.evaluate((elem) => elem.textContent);

                await page.evaluate((content) => {
                  javascript: document.open('text/html');
                  document.write(content);
                  document.close();
                }, content);
              },
            });
          },
        });

        return enrichBrowser;
      },
    },
  ],
})
export class BrowserModule {
  constructor(@Inject(BROWSER) private readonly browser: Browser) {}
  async onApplicationShutdown(signal: string) {
    const pages = await this.browser.pages();

    await Promise.all(pages.map((page) => page.close()));

    await this.browser.close();
  }
}
