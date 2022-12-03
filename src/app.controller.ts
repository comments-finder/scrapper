import {Controller, Get} from "@nestjs/common";
import {AppService} from "./app.service";
import {ArticleComment, ArticleCommentDocument} from "./schemas/articleComments.schema";

@Controller()
export class AppController {
}
