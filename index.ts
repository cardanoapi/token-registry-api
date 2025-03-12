import { AxiosResponse } from "axios";
import { apiError, APIError, handleApiError, isApiError } from "./handleError";
require("dotenv").config();
const express = require("express");
const axios = require("axios");

const app = express();
const port = process.env.SERVER_PORT ? process.env.SERVER_PORT : 8081;

// https://raw.githubusercontent.com/cardano-foundation/cardano-token-registry/refs/heads/master/mappings/00000000000410c2d9e01e8ec78ab1dc6bbc383fae76cbe2689beb024d49444153.json
const REPO_OWNER = "cardano-foundation";
const REPO_NAME = "cardano-token-registry";
const BRANCH_NAME = "master";

// Define the /metadata endpoint
app.get("/metadata/:id", async (req: any, res: any) => {
  try {
    const id = req.params.id as string;
    if (!id) {
      return res.status(400).json({ error: "missing required parameter 'id'" });
    }
    const tokenRegistryRequest = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/refs/heads/${BRANCH_NAME}/mappings/${id}.json`;
    const tokenRegistryResponse = await handleApiError(
      () => axios.get(tokenRegistryRequest),
      `Querying Github: ${tokenRegistryRequest}`
    );
    if (isApiError(tokenRegistryResponse)) {
      return res
        .status((tokenRegistryResponse as APIError).status)
        .send(tokenRegistryResponse);
    }
    return res.status(200).json((tokenRegistryResponse as AxiosResponse).data);
  } catch (error: any) {
    console.error(error);
    const errorMessage = apiError(
      "An error occured while querying github",
      error.message,
      500
    );
    return res.status(errorMessage.status).send(errorMessage);
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
