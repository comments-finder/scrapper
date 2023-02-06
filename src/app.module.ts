import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { ParsersModule } from './parsers/parsers.module';
import { MongooseModule } from '@nestjs/mongoose';
import { DB_URI, RABBITMQ_URI } from './config';
import {
  ArticleComment,
  ArticleCommentSchema,
} from './schemas/articleComments.schema';
import { AppController } from './app.controller';
import { ScheduleModule } from '@nestjs/schedule';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';

@Module({
  imports: [
    RabbitMQModule.forRoot(RabbitMQModule, {
      exchanges: [
        {
          name: 'comments',
          type: 'direct',
          options: {
            durable: true,
          },
        },
        {
          name: 'comments.dlx',
          type: 'direct',
          options: {
            durable: true,
          },
        },
      ],
      uri: RABBITMQ_URI,
      enableControllerDiscovery: true,
      channels: {
        'comments-publish': {},
        'comments-consume': {},
      },
    }),
    ParsersModule,
    MongooseModule.forRoot(DB_URI),
    MongooseModule.forFeature([
      { name: ArticleComment.name, schema: ArticleCommentSchema },
    ]),
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
