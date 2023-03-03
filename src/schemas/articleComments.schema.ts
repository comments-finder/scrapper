import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type ArticleCommentDocument = HydratedDocument<ArticleComment>;

@Schema()
export class ArticleComment {
  @Prop()
  source: string;

  @Prop()
  articleLink: string;

  @Prop()
  articleTitle: string;

  @Prop({ type: String, unique: true })
  text: string;

  @Prop({ type: Date })
  publicationDate: Date;
}

export const ArticleCommentSchema =
  SchemaFactory.createForClass(ArticleComment);
