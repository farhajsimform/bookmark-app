import {
  Test,
  TestingModule,
} from '@nestjs/testing';
import {
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';
import * as pactum from 'pactum';
import { AuthDto } from './../src/auth/dto';
import {
  CreateBookmarkDto,
  EditBookmarkDto,
} from './../src/bookmark/dto';
import { EditUserDto } from './../src/user/dto';

describe('APP e2e testing', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  beforeAll(async () => {
    const moduleReference: TestingModule =
      await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

    app = moduleReference.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    // Initializing app here
    await app.init();
    await app.listen(3002);
    prisma = app.get(PrismaService);
    await prisma.cleanDatabase();
    //Base URL for the api testing
    pactum.request.setBaseUrl(
      'http://localhost:3002',
    );
  });
  afterAll(() => {
    //Closing the app here
    app.close();
  });
  describe('Auth', () => {
    const dto: AuthDto = {
      email: 'farhajtest@gmail.com',
      password: 'farhajyyu45',
    };
    describe('Should handle Signup APIs', () => {
      it('API should throw error if email empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            password: dto.password,
          })
          .expectStatus(400);
      });
      it('API should throw error password empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            email: dto.email,
          })
          .expectStatus(400);
      });
      it('API should throw error no body provided', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .expectStatus(400);
      });
      it('should signup', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(201);
      });
    });

    describe('Should handle Signin APIs', () => {
      it('API should throw error if email empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            password: dto.password,
          })
          .expectStatus(400);
      });
      it('API should throw error if password empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            email: dto.email,
          })
          .expectStatus(400);
      });
      it('API should throw error if no body provided', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .expectStatus(400);
      });
      it('should signin successfully', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(dto)
          .expectStatus(200)
          .stores(
            'userAccessToken',
            'access_token',
          );
      });
    });
  });
  describe('User', () => {
    describe('Get me', () => {
      it('should get current user', () => {
        return pactum
          .spec()
          .get('/user/me')
          .withHeaders({
            Authorization:
              'Bearer $S{userAccessToken}',
          })
          .expectStatus(200);
      });
    });

    describe('Edit user', () => {
      it('should edit user', () => {
        const dto: EditUserDto = {
          firstName: 'farhaj',
          email: 'farhajtest@gmail.com',
        };
        return pactum
          .spec()
          .patch('/user/edit')
          .withHeaders({
            Authorization:
              'Bearer $S{userAccessToken}',
          })
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.firstName)
          .expectBodyContains(dto.email);
      });
    });
  });

  describe('Bookmarks', () => {
    describe('Get empty bookmarks', () => {
      it('should get bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmark/getall')
          .withHeaders({
            Authorization:
              'Bearer $S{userAccessToken}',
          })
          .expectStatus(200)
          .expectBody([]);
      });
    });

    describe('Create bookmark', () => {
      const dto: CreateBookmarkDto = {
        title: 'First Bookmark',
        link: 'https://www.youtube-nocookie.com/embed/GHTA143_b-s?playlist=GHTA143_b-s&autoplay=1&iv_load_policy=3&loop=1&modestbranding=1&start=',
      };
      it('should create bookmark', () => {
        return pactum
          .spec()
          .post('/bookmark')
          .withHeaders({
            Authorization:
              'Bearer $S{userAccessToken}',
          })
          .withBody(dto)
          .expectStatus(201)
          .stores('bookmarkId', 'id');
      });
    });

    describe('Get bookmarks', () => {
      it('API should get bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmark/getall')
          .withHeaders({
            Authorization:
              'Bearer $S{userAccessToken}',
          })
          .expectStatus(200)
          .expectJsonLength(1);
      });
    });

    describe('Get bookmark by id', () => {
      it('API should get bookmark by id', () => {
        return pactum
          .spec()
          .get('/bookmark/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization:
              'Bearer $S{userAccessToken}',
          })
          .expectStatus(200)
          .expectBodyContains('$S{bookmarkId}');
      });
    });

    describe('Edit bookmark by id', () => {
      const dto: EditBookmarkDto = {
        title: 'Its test tittle',
        description: 'Its test description',
      };
      it('API should edit bookmark', () => {
        return pactum
          .spec()
          .patch('/bookmark/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization:
              'Bearer $S{userAccessToken}',
          })
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.title)
          .expectBodyContains(dto.description);
      });
    });

    describe('Delete bookmark by id', () => {
      it('API should delete bookmark', () => {
        return pactum
          .spec()
          .delete('/bookmark/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization:
              'Bearer $S{userAccessToken}',
          })
          .expectStatus(204);
      });

      it('API should get empty bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmark/getall')
          .withHeaders({
            Authorization:
              'Bearer $S{userAccessToken}',
          })
          .expectStatus(200)
          .expectJsonLength(0);
      });
    });
  });
});
