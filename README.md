# Anime Image Management Service

An API for uploading, moderating, and searching (mostly) anime-style images.

# Installation

Dependencies:

-   [Node JS](https://nodejs.org/en/) v16 or higher. Non-LTS and versions below 16 will probably work, but haven't been tested.
-   [pnpm](https://pnpm.io/), recommended but npm and yarn should still work fine.

You can easily get pnpm using:

```sh
npm i -g pnpm
```

Now you can set up the repository from a terminal:

```sh
git clone https://github.com/Weebs-Incorporated/AIMS.git AIMS
cd AIMS
pnpm install
cp config.example.json config.json
```

You now need to enter some information such as the JWT secret and Mongo URI.

Documentation for all the values can be found [here](src/config.ts).

Afterwards you can run scripts using `pnpm <script name>`, e.g. `pnpm start`.

# Script Reference

-   `start` Starts API in with hot-reloading enabled.
-   `build` Compiles API into JavaScript.
-   `lint` Makes sure code follows style rules.
-   `typecheck` Makes sure there are no type errors in the code.
-   `test` Runs testing using Jest.
-   `check-all` Does linting, typechecking, and testing.

# Dependency Reference

-   `axios` Makes web requests easy.
-   `bcrypt` Does password hashing.
-   `cors` Allows configured websites to use the API.
-   `express` Web framework the API uses.
-   `express-openapi-validator` Ensures endpoints match their documentation.
-   `express-rate-limit` Rate limits users of the API.
-   `image-size` ?
-   `jsonwebtoken` Helps with user authorization.
-   `mongoose` Helps with MongoDB database interactions.
-   `swagger-ui-express` Framework for API documentation.
