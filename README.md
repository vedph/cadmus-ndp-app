# Cadmus NDP App

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.2.10.

- NDP-specific models:
  - [books](https://github.com/vedph/cadmus-ndp-books)
  - [fragments](https://github.com/vedph/cadmus-ndp-frac)
  - [drawings](https://github.com/vedph/cadmus-ndp-drawings)

## Docker

🐋 Quick Docker image build:

1. `npm run build-lib`
2. update version in `env.js` and `ng build`
3. `docker build . -t vedph2020/cadmus-ndp-app:0.0.1 -t vedph2020/cadmus-ndp-app:latest` (replace with the current version).

## TODO

- TODO list:
  - add libraries for NDP models
  - set API port in env.js
  - complete and adjust part-editor-keys.ts
  - complete and adjust app.routes.ts
  - complete and adjust app.config.ts
  - adjust Docker files
