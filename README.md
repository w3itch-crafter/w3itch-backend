W3itch Backend

## Description

W3itch is a self-hostable application allowing you to upload/play games.

## Configuration

```bash
# Generate JWT key
$ yarn keygen
# Make log directory
$ sudo mkdir -p /var/log/w3itch-backend
# Development mode only
$ cp config/config.example.yaml config/config.development.yaml
# Production mode only
$ cp config/config.example.yaml config/config.development.yaml
```

The config directory should look like this:

```
config
|____config.development.yaml  # development mode only
|____config.example.yaml
|____config.production.yaml   # production mode only
|____JWT_PRIVATE_KEY.pem
|____JWT_PUBLIC_KEY.pub
```

Update db & redis configuration in `config/config.development.yaml`. For example:

```yaml
db:
  host: localhost
  port: 3306
  username: w3itch-dev
  password: w3itch-dev
  database: w3itch-dev
  charset: utf8mb4_general_ci
  timzone: Z

redis:
  host: localhost
  port: 6379
  pass:
  vcode_ttl: 300 # seconds
```

## Installation

```bash

$ yarn install
# migration
$ yarn typeorm migration:run
```

## Running the app

```bash
# development
$ yarn start

# watch mode
$ yarn start:dev

# production mode
$ yarn start:prod
```

## Test

```bash
# unit tests
$ yarn test

# e2e tests
$ yarn test:e2e

# test coverage
$ yarn test:cov
```

## Conventional Commits

This project is following [commitlint](https://github.com/conventional-changelog/commitlint) rules and checks the commit message with [husky](https://typicode.github.io/husky/#/?id=features). You can also follow the [Local setup](https://commitlint.js.org/#/guides-local-setup) installation guide to install this lint in your project, like following:

```bash
# Install and configure if needed
yarn add @commitlint/{cli,config-conventional} --dev
echo "module.exports = { extends: ['@commitlint/config-conventional'] };" > commitlint.config.js

# Install Husky
yarn add husky --dev

# Active hooks
npx husky install
# or
yarn husky install

# Add hook
npx husky add .husky/commit-msg 'npx --no-install commitlint --edit $1'
# or
yarn husky add .husky/commit-msg 'yarn commitlint --edit $1'
```
