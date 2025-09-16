# Cadmus NDP App

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.2.10.

- NDP-specific models:
  - [books](https://github.com/vedph/cadmus-ndp-books)
  - [fragments](https://github.com/vedph/cadmus-ndp-frac)
  - [drawings](https://github.com/vedph/cadmus-ndp-drawings)
- other models:
  - [codicology](https://github.com/vedph/cadmus-codicology)
  - [codicological formulas](https://github.com/vedph/cod-layout-view)
  - [epigraphy](https://github.com/vedph/cadmus-epigraphy)
  - [iconography](https://github.com/vedph/cadmus-iconography)

## Docker

🐋 Quick Docker image build:

1. `npm run build-lib`
2. update version in `env.js` and `ng build --configuration=production`
3. `docker build . -t vedph2020/cadmus-ndp-app:0.0.1 -t vedph2020/cadmus-ndp-app:latest` (replace with the current version).

## History

- 2025-09-16:
  - refactored for full reactivity.
  - updated Angular and packages.
- 2025-08-28: updated Angular and packages.
- 2025-08-18: added figurative plan part editor.
- 2025-08-17: adding figurative plan item editor and its dependencies.
- 2025-08-14:
  - added features to FRAC layout part and let it opt in for role-dependent thesauri. This allows using this part also for printed books.
  - added books figurative plan library.
- 2025-08-07:
  - updated Angular and packages.
  - updated Docker compose bibliography API version.
- 2025-07-24:
  - updated Angular and packages.
  - added JWT URI exception for VIAF.
  - replaced guards and interceptor.
- 2025-07-23: updated Angular and packages.
- 2025-07-17:
  - updated Angular and packages.
  - added citation configurations.

### 0.0.1

- 2025-07-16: updated Angular and packages.
- 2025-07-14:
  - updated Angular.
  - updated packages after replacing graph rendering library in walker. This implied installing `force.graph` and `three.js`.
