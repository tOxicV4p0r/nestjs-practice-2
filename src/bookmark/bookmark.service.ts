import { Injectable,ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookMarkDto ,EditBookMarkDto} from './dto';

@Injectable()
export class BookmarkService {
    constructor(private prisma: PrismaService) { }

    createBookmark(userId: number, dto: CreateBookMarkDto) {
        return this.prisma.bookmark.create({
            data: {
                userId,
                ...dto,
            }
        })
    }

    getBookmarks(userId: number) {
        return this.prisma.bookmark.findMany({
            where: {
                userId,
            }
        })
    }

    async getBookmarkById(userId: number, bookmarkId: number) {
        const bookmark = await this.prisma.bookmark.findUnique({
            where: {
                userId,
                id: bookmarkId,
            }
        });

        if(!bookmark)
            throw new ForbiddenException('Access to resource denied');

        return bookmark
    }

    async editBookmarkById(userId:number , bookmarkId:number, dto : EditBookMarkDto) { 
        const bookmark = await this.prisma.bookmark.findUnique({
            where:{
                id:bookmarkId,
            }
        });

        if(!bookmark)
            throw new ForbiddenException('Access to resource denied');

        if(bookmark.userId !== userId)
            throw new ForbiddenException('Access to resource denied');

        const editedBookmark = await this.prisma.bookmark.update({
            where:{
                id:bookmarkId,
            },
            data:{
                ...dto,
            }
        });

        return editedBookmark;
    }

    async deleteBookmarkById(userId:number, bookmarkId: number) {
        const bookmark = await this.prisma.bookmark.findUnique({
            where:{
                id:bookmarkId,
            }
        });

        if(!bookmark)
            throw new ForbiddenException('Access to resource denied');

        if(bookmark.userId !== userId)
            throw new ForbiddenException('Access to resource denied');

        await this.prisma.bookmark.delete({
            where:{
                id:bookmarkId,
            }
        })
    }
}
