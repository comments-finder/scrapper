import {Injectable} from '@nestjs/common';
import {DouParserService} from "./parsers/dou.service";
import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import {ArticleComment, ArticleCommentDocument} from "./schemas/articleComments.schema";

@Injectable()
export class AppService {
  constructor(private readonly douParserService: DouParserService, @InjectModel(ArticleComment.name) private articleCommentModel: Model<ArticleCommentDocument>) {}

  async getHello () {
    const articlesLinks = await this.douParserService.getArticlesLinks();

    const result = await Promise.allSettled(articlesLinks.map(link => this.douParserService.getArticleComments(link)));

    const errors = [];

    const articlesComments = result.reduce((prev, next, index) => {
      const articleLink = articlesLinks[index];

      if (next.status === 'fulfilled') {
        const data = (next as PromiseFulfilledResult<string[]>).value;

        return [...prev, ...data.map(item => ({text: item, articleLink}))]
      }

      errors.push({ articleLink, next });

      return prev;
    }, []);


    console.log('======errors', errors);

    try {
      const dbRes = await this.articleCommentModel.insertMany(articlesComments, { ordered: false });
      console.log('=======dbRes', dbRes)
    } catch (e) {
      console.log(e);
    }
  }

  async getAllComments(): Promise<ArticleComment[]> {
    return this.articleCommentModel.find().exec();
  }
}
