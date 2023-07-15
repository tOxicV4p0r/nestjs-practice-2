import { INestApplication, ValidationPipe } from "@nestjs/common"
import { Test } from "@nestjs/testing";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/prisma/prisma.service";
import * as pactum from 'pactum';
import { AuthDto } from "../src/auth/dto";
import { EditUserDto } from "../src/user/dto";
import { CreateBookMarkDto , EditBookMarkDto} from "src/bookmark/dto";

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      })
    )
    await app.init();

    prisma = app.get(PrismaService);
    await prisma.cleanDb();
    await app.listen(3334);
    pactum.request.setBaseUrl('http://localhost:3334')
  });

  afterAll(() => {
    app.close();
  })

  describe('Auth', () => {
    const dto: AuthDto = {
      email: 'sdfad@hsdfsd.com',
      password: '12323',
    };

    describe('Sign up', () => {
      it('should throw 400 if password empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({ email: dto.email })
          .expectStatus(400)
      });

      it('should throw 400 if password empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({ password: dto.password })
          .expectStatus(400)
      });

      it('should throw 400 if no data', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .expectStatus(400)
      });

      it('should sign up', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(201)
          .expectBodyContains('access_token')
          .stores('userAt', 'access_token');
      });
    });

    describe('Sign in', () => {
      it('should throw 400 if password empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({ email: dto.email })
          .expectStatus(400)
      });

      it('should throw 400 if password empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({ password: dto.password })
          .expectStatus(400)
      });

      it('should throw 400 if no data', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .expectStatus(400)
      });

      it('should sign in', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains('access_token');
      });
    });
  });

  describe('User', () => {
    describe('Get me', () => {
      it('should current user', () => {
        return pactum
          .spec()
          .get('/users/me')
          .withHeaders("Authorization", "Bearer $S{userAt}")
          .expectStatus(200);
      });
    });

    describe('Edit user', () => {
      const dtoEdit: EditUserDto = {
        firstName: 'test',
        lastName: 'testLast',
      };

      it('should edit user', () => {
        return pactum
          .spec()
          .patch('/users')
          .withBody(dtoEdit)
          .withHeaders("Authorization", "Bearer $S{userAt}")
          .expectBodyContains(dtoEdit.firstName);
      });
    });
  });

  describe('Bookmark', () => {
    describe('Get bookmarks', () => {
      it('should get empty bookmark', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders("Authorization", "Bearer $S{userAt}")
          .expectJsonLength(0);
      });
    });

    describe('Create bookmark', () => {
      const dtoBookmark: CreateBookMarkDto = {
        title: 'test1',
        link: 'http://test.link',
      }

      it('should throw if empty title', () => {
        return pactum
          .spec()
          .post('/bookmarks')
          .withHeaders("Authorization", "Bearer $S{userAt}")
          .withBody({ link: dtoBookmark.link })
          .expectStatus(400);
      });

      it('should throw if empty link', () => {
        return pactum
          .spec()
          .post('/bookmarks')
          .withHeaders("Authorization", "Bearer $S{userAt}")
          .withBody({ title: dtoBookmark.title })
          .expectStatus(400);
      });

      it('should throw if empty body', () => {
        return pactum
          .spec()
          .post('/bookmarks')
          .withHeaders("Authorization", "Bearer $S{userAt}")
          .expectStatus(400);
      });

      it('should create new bookmark', () => {
        return pactum
          .spec()
          .post('/bookmarks')
          .withHeaders("Authorization", "Bearer $S{userAt}")
          .withBody(dtoBookmark)
          .expectStatus(201)
          .expectBodyContains(dtoBookmark.title);
      });

      it('should create new bookmark', () => {
        return pactum
          .spec()
          .post('/bookmarks')
          .withHeaders("Authorization", "Bearer $S{userAt}")
          .withBody(dtoBookmark)
          .expectStatus(201)
          .expectBodyContains(dtoBookmark.title)
          .stores('bookmarkId', 'id');
      });

    });


    describe('Get bookmarks', () => {
      it('should get 2 bookmark', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders("Authorization", "Bearer $S{userAt}")
          .expectJsonLength(2);
      });
    });

    describe('Get bookmark by ID', () => { 
      it(`should get bookmark by id`,()=>{
        return pactum
          .spec()
          .get('/bookmarks/$S{bookmarkId}')
          .withHeaders("Authorization", "Bearer $S{userAt}")
          .expectBodyContains("$S{bookmarkId}")
      });
    });

    describe('Edit bookmark by ID', () => { 
      const dtoEdit: EditBookMarkDto = {
        title: 'testEdit',
        link: 'http://test.link',
      }
      it('should edit bookmark',()=>{
        return pactum
        .spec()
        .patch('/bookmarks/$S{bookmarkId}')
        .withBody(dtoEdit)
        .withHeaders("Authorization", "Bearer $S{userAt}")
        .expectBodyContains(dtoEdit.title)
      });
    });

    describe('Delete bookmark by ID', () => {
      it('should delete bookmark',()=>{
        return pactum
        .spec()
        .delete('/bookmarks/$S{bookmarkId}')
        .withHeaders("Authorization", "Bearer $S{userAt}")
        .expectStatus(204);
      });

      it(`should throw 400`,()=>{
        return pactum
          .spec()
          .get('/bookmarks/$S{bookmarkId}')
          .withHeaders("Authorization", "Bearer $S{userAt}")
          .expectStatus(403).inspect();
      });

     });

  });
});