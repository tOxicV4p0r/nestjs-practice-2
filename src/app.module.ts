import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { BookmarkModule } from './bookmark/bookmark.module';
import { TestModule } from './test/test.module';

@Module({
  imports: [AuthModule, BookmarkModule, TestModule],
})
export class AppModule { }
