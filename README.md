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
$ cp config/config.example.yaml config/config.production.yaml
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

Update db & redis & storage configuration in `config/config.development.yaml`. For example:

```yaml
app:
  name: w3itch-backend
  port: 3002
  bodyParser:
    limit: 50mb
  swagger:
    enable: true
  logger:
    loki:
      enable: true
      url: 'http://127.0.0.1:3100'

db:
  host: localhost
  port: 3306
  username: w3itch-dev
  password: w3itch-dev
  database: w3itch-dev
  charset: utf8mb4_general_ci
  timezone: Z

auth:
  jwt:
    accessTokenName: 'w3itch_access_token'
    refreshTokenName: 'w3itch_refresh_token'
    accessTokenExpires: '20m'
    refreshTokenExpires: '30d'
    issuer: https://w3itch.io
    algorithm: 'RS512'
    audience: []

  cookies:
    accessTokenPath: '/'
    refreshTokenPath: '/accounts/tokens'

  cors:
    origins:
      - '*'

cache:
  redis:
    host: '127.0.0.1'
    port: 6379
    pass:
  vcode:
    ttl: 3000 # seconds

storage:
  ipfs:
    fleek:
      # See: https://docs.fleek.co/storage/fleek-storage-js/
      apiKey: foo
      apiSecret: bar
      folder: w3itch/attachment
    gateways:
      - https://ipfs.fleek.co
  aws:
    accessKeyId:
    secretAccessKey:
    bucket:
    folder: w3itch-test/attachment
    ## Leave this empty or commented to use the default host
    ## If you want to use a custom host, you can set it here with the following format
    ## It should resolve to aws with your bucket name
    ## https://s3.amazonaws.com/{bucket}
    # customBaseUrl: https://my-custom-host/
    

blockchain:
  infura:
    apiToken: foo
  # Supported blockchain networks
  # You must add a provider for each blockchain network in web3.providers.ts
  # and enable it here in order to add a new blockchain network
  supportedChainIds: [1, 3, 4, 5, 10, 42, 56, 97, 137, 42161]

account:
  github:
    clientId: foo
    clientSecret: bar

user:
  username:
    reservedList:
      - blog
      - api
    # - etc.
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
