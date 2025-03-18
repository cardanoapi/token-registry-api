# **Token Registry API**  

The **Token Registry API** queries the Cardano Token Registry's GitHub repository to fetch off-chain metadata of tokens.  

🔗 **Token Registry Repository:** [Cardano Token Registry - Mappings](https://github.com/cardano-foundation/cardano-token-registry/tree/master/mappings)  

---

## **Steps to Run Locally**  

1. **Set Environment Variables**  
   - Create a `.env` file and specify the following variables:  
     - `SERVER_PORT`: Port to run the API (Default: `8080`)  
     - `SCHEDULE_UPDATE`: Set to `true` to enable scheduled (re-clones the repo every 2 days)
     - `USE_GH_API`: Set to `true` to directly query github, else uses the cached info from build-time   

2. **Install Dependencies & Start Server**  
   ```sh
   yarn && yarn start
   ```
3. **Endpoints**
    - *GET* `/health` : Health info
    - *GET* `/meetadata/:id` : Offchain metadata info of an asset
    - *POST* `/clone` : force clone the mappings folder from the token registry repo

---

## **Run with Docker**  

```sh
docker run -p 8080:8080 \
  -e SCHEDULE_UPDATE=true \
  -e USE_GH_API=false \
  -e SERVER_PORT=8080 \
  ghcr.io/cardanoapi/token-registry-api:latest
```
---