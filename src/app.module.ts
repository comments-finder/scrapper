import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import {ParsersModule} from "./parsers/parsers.module";
import {MongooseModule} from "@nestjs/mongoose";
import {DB_URI} from "./config";
import {ArticleComment, ArticleCommentSchema} from "./schemas/articleComments.schema";
import {AppController} from "./app.controller";

@Module({
  imports: [ParsersModule, MongooseModule.forRoot(DB_URI), MongooseModule.forFeature([{ name: ArticleComment.name, schema: ArticleCommentSchema }])],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
