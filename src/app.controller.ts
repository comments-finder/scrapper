import {Controller, Get} from "@nestjs/common";
import {AppService} from "./app.service";
import {ArticleComment, ArticleCommentDocument} from "./schemas/articleComments.schema";

@Controller()
export class AppController {
    constructor(private appService: AppService) {}

    @Get()
    async findAll(): Promise<ArticleComment[]> {
        return this.appService.getAllComments();
    }
}
