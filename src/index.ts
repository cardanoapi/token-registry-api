import { apiError } from "./handleError";
import { cacheHealth, queryCache } from "./queryCache";
import { githubHealth, queryGithub } from "./queryGithub";
import { runClone } from "./clone";
import {
  BRANCH_NAME,
  INTERVAL,
  LOCAL_DIR,
  REPO_NAME,
  REPO_OWNER,
  REPO_URL,
} from "./config";

require("dotenv").config();
const express = require("express");

const app = express();
const port = process.env.SERVER_PORT ? process.env.SERVER_PORT : 8081;
const scheduleUpdate = process.env.SCHEDULE_UPDATE
  ? process.env.SCHEDULE_UPDATE === "true"
  : false;

// Define the /metadata endpoint
app.get("/metadata/:id", async (req: any, res: any) => {
  try {
    const id = req.params.id as string;
    if (!id) {
      return res.status(400).json({ error: "missing required parameter 'id'" });
    }
    if (scheduleUpdate) {
      return await queryCache(LOCAL_DIR, id, res);
    } else {
      const tokenRegistryRequest = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/refs/heads/${BRANCH_NAME}/mappings/${id}.json`;
      return await queryGithub(tokenRegistryRequest, res);
    }
  } catch (error: any) {
    console.error(error);
    const errorMessage = apiError(
      "An unexpected error occured",
      error.message,
      500
    );
    return res.status(errorMessage.status).send(errorMessage);
  }
});

runClone(scheduleUpdate);
setInterval(async () => {
  if (scheduleUpdate) {
    console.log(
      `Updating mapings from ${`https://github.com/${REPO_OWNER}/${REPO_NAME}.git`}`
    );
    await runClone(true);
  }
}, INTERVAL);

app.get("/health", async (req: any, res: any) => {
  try {
    if (scheduleUpdate) {
      return await cacheHealth(res);
    } else {
      return await githubHealth(res);
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", data: error, status: 500 });
  }
});

app.post("/clone", async (req: any, res: any) => {
  try {
    await runClone(true);
    res.status(200).json({ message: `${REPO_URL} cloned successfully` });
  } catch (error) {
    res.status(500).json({ error: "Server error", details: error });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
