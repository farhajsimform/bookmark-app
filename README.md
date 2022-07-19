
# Nest Js Bookmark APP

In this APP I created a bookmarks API from scratch using nestJs, docker, postgres, passport js, prisma, pactum and dotenv.


## Installation

Using below commands you can run project in development mode

```bash
yarn // install
yarn db:dev:restart // start postgres in docker and push migrations
yarn start:dev // start api in dev mode
```

It provides an interface where we can quickly have a look at the data of local database
```bash
npx prisma studio
```
Using below command we can run the e2e test cases
```bash
yarn run test:e2e
```
## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`DATABASE_URL`

`JWT_SECRET`

