import { PrismaService } from '../prisma/prisma.service';
import { CreateBookmarkDto, EditBookmarkDto } from './dto';
export declare class BookmarkService {
    private prisma;
    constructor(prisma: PrismaService);
    getBookmarks(userId: number): import(".prisma/client").PrismaPromise<import(".prisma/client").Bookmark[]>;
    getBookmarkById(userId: number, bookmarkId: number): import(".prisma/client").Prisma.Prisma__BookmarkClient<import(".prisma/client").Bookmark>;
    createBookmark(userId: number, dto: CreateBookmarkDto): Promise<import(".prisma/client").Bookmark>;
    editBookmarkById(userId: number, bookmarkId: number, dto: EditBookmarkDto): Promise<import(".prisma/client").Bookmark>;
    deleteBookmarkById(userId: number, bookmarkId: number): Promise<void>;
}
