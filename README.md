# Token Registry API

- Queries token registry's github to get off-chain metadata of tokens
- https://github.com/cardano-foundation/cardano-token-registry/tree/master/mappings

# Steps to run

- specify `SERVER_PORT` in `.env` file (Default is 8081)
- specify `SCHEDULE_UPDATE` in `.env` file to clone data from token registry and use it as cache
- `yarn && yarn start`

# Run Image

`docker run -p 8082:8082 -e SCHEDULE_UPDATE=true -e SERVER_PORT=8082 ghcr.io/cardanoapi/token-registry-api:null`
