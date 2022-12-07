# Anime Image Management Service [![CodeQL](https://github.com/Weebs-Incorporated/AIMS/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/Weebs-Incorporated/AIMS/actions/workflows/codeql-analysis.yml)[![Node.js CI](https://github.com/Weebs-Incorporated/AIMS/actions/workflows/node.js.ci.yml/badge.svg)](https://github.com/Weebs-Incorporated/AIMS/actions/workflows/node.js.ci.yml)[![codecov](https://codecov.io/github/Weebs-Incorporated/AIMS/branch/main/graph/badge.svg?token=IQCUNAQLW4)](https://codecov.io/github/Weebs-Incorporated/AIMS)

![image](./.github/images/AIMS.png)

An API for uploading, moderating, and searching (mostly) anime-style images.

# Installation

Dependencies:

-   [Node JS](https://nodejs.org/en/) v16 or higher. Non-LTS and versions below 16 will probably work, but haven't been tested.
-   [pnpm](https://pnpm.io/), recommended but npm and yarn should still work fine.

You can easily get pnpm using:

```sh
npm i -g pnpm
```

First will need to set up a MongoDB cluster, and provide a connection URI for it (`mongodb+srv://...`). If you aren't sure how to do this, see the [setting up MongoDB](./.github/docs/MongoDBGuide.md) guide.

Next you can set up the repository from a terminal:

```sh
git clone https://github.com/Weebs-Incorporated/AIMS.git AIMS
cd AIMS
pnpm install
cp config.example.json config.json
```

Finally enter your Mongo URI and Google client secret into the [config.json](./config.json) file you just created. There are a lot of other configuration options you can give to the API, a JSON schema for all the values can be found [here](.github/config-schema.json).

All done! You can now run scripts using `pnpm <script name>`, e.g. `pnpm start`.

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

# Production Build

Remember to set the `NODE_ENV` environment variable to `production` if you want to start the API in production mode.

```sh
# Linux & Mac
export NODE_ENV=production

# Windows
$env:NODE_ENV = 'production'
```

# Additional Setup

-   You can supply a Google OAuth Client ID to enable the `/login/google` endpoint, allowing users to register and log in via Google

    -   For more info see [setting up Google OAuth](./.github/docs/GoogleOAuthGuide.md).

-   Discord OAuth setup: _coming soon_.
