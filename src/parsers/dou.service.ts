import {Parser} from "./types";
import {Injectable} from "@nestjs/common";

@Injectable()
export class DouParserService extends Parser {
    async getArticleComments(link) {

        const page = await this.browser.newPage();

        await page.goto(link);

        await page.waitForSelector('#commentsList > .b-comment');

        const res = await page.evaluate(resultsSelector => {
            return [...document.querySelectorAll(resultsSelector)].map(item => {
                return item.textContent;
            });
        }, '#commentsList > .b-comment .comment_text > p');

        await page.close();

        return res
    }
    async getArticlesLinks() {
        const page = await this.browser.newPage();
        await page.goto('https://dou.ua/forums/');
        await page.waitForSelector('.b-forum-articles > article');

        const res = await page.evaluate(resultsSelector => {
          return [...document.querySelectorAll(resultsSelector)].map(anchor => {
            return anchor.getAttribute('href');
          });
        }, '.b-forum-articles > article h2 > a:first-child');


        await page.close();

        return res;
    }
}
