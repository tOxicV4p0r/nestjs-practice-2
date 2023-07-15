import { Controller, Get, Post, Patch, Delete, UseGuards, Body, Param, ParseIntPipe, HttpStatus ,HttpCode} from '@nestjs/common';
import { GetUser } from '../auth/decorator';
import { BookmarkService } from './bookmark.service';
import { JwtGuard } from '../auth/guard';
import { CreateBookMarkDto, EditBookMarkDto} from './dto';

@UseGuards(JwtGuard)
@Controller('bookmarks')
export class BookmarkController {
    constructor(private bookmarkService: BookmarkService) { }

    @Post()
    createBookmark(@GetUser('id') userId: number, @Body() dto: CreateBookMarkDto) {
        return this.bookmarkService.createBookmark(userId, dto);
    }

    @Get()
    getBookmarks(@GetUser('id') userId: number) {
        return this.bookmarkService.getBookmarks(userId);
    }

    @Get(":id")
    getBookmarkById(@GetUser('id') userId: number, @Param('id', ParseIntPipe) bookmarkId: number) {
        return this.bookmarkService.getBookmarkById(userId, bookmarkId);
    }

    @Patch(':id')
    editBookmarkById(@GetUser('id') userId:number, @Param('id', ParseIntPipe) bookmarkId: number,@Body() dto: EditBookMarkDto){
        return this.bookmarkService.editBookmarkById(userId, bookmarkId, dto);
    }

    @HttpCode(HttpStatus.NO_CONTENT)
    @Delete(':id')
    deleteBookmarkById(@GetUser('id') userId:number, @Param('id', ParseIntPipe) bookmarkId:number){
        return this.bookmarkService.deleteBookmarkById(userId, bookmarkId);
    }
}
