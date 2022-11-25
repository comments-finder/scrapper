import {HydratedDocument} from "mongoose";
import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";

export type ArticleCommentDocument = HydratedDocument<ArticleComment>;

@Schema()
export class ArticleComment {
    @Prop()
    articleLink: string;

    @Prop({ type: String, unique: true })
    text: string;
}

export const ArticleCommentSchema = SchemaFactory.createForClass(ArticleComment);
