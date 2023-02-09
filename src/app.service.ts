import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ArticleComment,
  ArticleCommentDocument,
} from './schemas/articleComments.schema';
import { DouParserService } from './parsers/dou.service';
import { Cron } from '@nestjs/schedule';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { AMQP_TIMEOUT, CRON } from './config';
import { ArticleLinks } from './parsers/types';

interface ArticleComments {
  articleLink: string;
  articleTitle: string;
  comments: string[];
}

interface ArticleCommentsResult {
  comments: ArticleComments[];
  errors: Error[];
}

@Injectable()
export class AppService {
  private inProgress = false;
  private readonly logger = new Logger(AppService.name);

  constructor(
    private readonly douParserService: DouParserService,
    @InjectModel(ArticleComment.name)
    private articleCommentModel: Model<ArticleCommentDocument>,
    private readonly amqpConnection: AmqpConnection,
  ) {}

  private parseArticlesCommentsFromPromises(
    articlesCommentsResults,
    articlesLinks,
  ): ArticleCommentsResult {
    const errors = [];

    const comments = articlesCommentsResults.reduce((prev, next, index) => {
      const articleLink = articlesLinks[index];

      if (next.status === 'fulfilled') {
        const data = (next as PromiseFulfilledResult<string[]>).value;

        return [...prev, { articleLink, comments: data }];
      }

      errors.push({ articleLink, next });

      return prev;
    }, []);

    return { errors, comments };
  }

  private async getDouArticlesCommentsInParallel(
    articlesLinks: string[],
  ): Promise<ArticleCommentsResult> {
    const articlesCommentsPromises = articlesLinks.map((link) =>
      this.douParserService.getArticleComments(link),
    );
    const articlesCommentsResults = await Promise.allSettled(
      articlesCommentsPromises,
    );

    return this.parseArticlesCommentsFromPromises(
      articlesCommentsResults,
      articlesLinks,
    );
  }

  private async getDouArticlesCommentsConsec(
    articlesLinks: ArticleLinks[],
  ): Promise<ArticleCommentsResult> {
    const comments: ArticleComments[] = [];
    const errors = [];

    for (const articlesLink of articlesLinks) {
      try {
        const res = await this.douParserService.getArticleComments(
          articlesLink.link,
        );

        comments.push({
          articleLink: articlesLink.link,
          articleTitle: articlesLink.title,
          comments: res,
        });
      } catch (e) {
        errors.push(e);
      }
    }

    return { comments, errors };
  }

  private mapArticleCommentsToDTOs(
    articlesComments: ArticleComments[],
  ): ArticleComment[] {
    return articlesComments.flatMap((articleComments) =>
      articleComments.comments.map((comment) => ({
        text: comment,
        articleLink: articleComments.articleLink,
        articleTitle: articleComments.articleTitle,
      })),
    );
  }

  private async saveComments(comments: ArticleComments[]) {
    const commentsDTOs = this.mapArticleCommentsToDTOs(comments);

    let insertedDocsResult;

    try {
      const dbRes = await this.articleCommentModel.insertMany(commentsDTOs, {
        ordered: false,
        rawResult: false,
      });

      this.logger.log(`Inserted in DB: ${dbRes?.length}`);

      insertedDocsResult = dbRes;
    } catch (e) {
      const { writeErrors, insertedDocs } = e;
      this.logger.log(`Failed to insert in DB: ${writeErrors?.length}`);
      this.logger.log(`Inserted in DB: ${insertedDocs?.length}`);

      insertedDocsResult = insertedDocs;
    }

    return insertedDocsResult;
  }

  private async getDouArticlesComments() {
    const articlesLinks = await this.douParserService.getArticlesLinks();

    return await this.getDouArticlesCommentsConsec(articlesLinks);
  }

  @Cron(CRON)
  async parse() {
    try {
      if (this.inProgress) {
        return this.logger.log("Skip parsing due to the it's in progress!");
      }

      this.logger.log('Start parse!');

      this.inProgress = true;

      const { errors, comments } = await this.getDouArticlesComments();

      this.logger.log(
        `Failed to fetch comments from ${errors?.length} articles`,
      );
      this.logger.log(`Fetched comments from ${comments?.length} articles`);

      this.inProgress = false;

      const insertedDocsResult = await this.saveComments(comments);

      if (!insertedDocsResult.length) return;

      const res = await this.amqpConnection.request<any>({
        exchange: 'comments',
        routingKey: 'new-comments',
        payload: JSON.stringify(insertedDocsResult || []),
        timeout: AMQP_TIMEOUT,
      });

      this.logger.log(res);
    } catch (e) {
      this.inProgress = false;
      this.logger.error(e, e.stack);
    }
  }

  async sendAllComments() {
    const comments = await this.articleCommentModel.find().exec();

    const res = await this.amqpConnection.request<any>({
      exchange: 'comments',
      routingKey: 'new-comments',
      payload: JSON.stringify(comments || []),
      timeout: AMQP_TIMEOUT,
    });

    this.logger.log(res);
  }

  async onApplicationBootstrap() {
    try {
      await this.parse();
      await this.sendAllComments();
    } catch (e) {
      this.logger.error(e, e.stack);
    }
  }
}
