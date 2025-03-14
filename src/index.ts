import path from "path";
import fs from "fs";
import { apiError } from "./handleError";
import { queryCache } from "./queryCache";
import { queryGithub } from "./queryGithub";
import { runClone } from "./clone";
import { differenceInSeconds } from "date-fns";

require("dotenv").config();
const express = require("express");

const app = express();
const port = process.env.SERVER_PORT ? process.env.SERVER_PORT : 8081;
const scheduleUpdate = process.env.SCHEDULE_UPDATE
  ? process.env.SCHEDULE_UPDATE === "true"
  : false;

const REPO_OWNER = "cardano-foundation";
const REPO_NAME = "cardano-token-registry";
const BRANCH_NAME = "master";
const FOLDER_NAME = "mappings";
const LOCAL_DIR = "offchain-metadata";
const REPO_URL = `https://github.com/${REPO_OWNER}/${REPO_NAME}.git`;
const DAYS = 2;
const INTERVAL = DAYS * 24 * 60 * 60 * 1000;

type Health = {
  lastCommit: {
    hash: string;
    message: string;
    author: string;
    date: string;
  }; // last commit details. read from LOCAL_DIR/.commit file
  lastCloned: string; // read this from LOCAL_DIR/.timestamp file
  nextClone: string; // add INTERVAL milliseconds to the timestamp file and create a date object .toISOstring()
  eta: string; // calculate the hours:minutes:seconds between current and next time
};

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

runClone(REPO_URL, LOCAL_DIR, FOLDER_NAME);
setInterval(async () => {
  console.log(
    `Updating mapings from ${`https://github.com/${REPO_OWNER}/${REPO_NAME}.git`}`
  );
  await runClone(REPO_URL, LOCAL_DIR, FOLDER_NAME);
}, INTERVAL);

app.get("/health", async (req: any, res: any) => {
  try {
    const timestampFilePath = path.join(LOCAL_DIR, ".timestamp");
    const timestampFileExists = fs.existsSync(timestampFilePath);
    const lastCommitFilePath = path.join(LOCAL_DIR, ".commit");
    const lastCommitFileExists = fs.existsSync(lastCommitFilePath);
    if (!timestampFileExists) {
      return res.status(404).json({
        error: `.timestamp file not found in ${LOCAL_DIR}`,
      });
    }
    if (!lastCommitFileExists) {
      return res.status(404).json({
        error: `.commit file not found in ${LOCAL_DIR}`,
      });
    }

    const timestampData = await fs.promises.readFile(
      timestampFilePath,
      "utf-8"
    );
    const lastCommitDetails = await fs.promises.readFile(
      lastCommitFilePath,
      "utf-8"
    );
    const lastClonedDate = new Date(timestampData);

    const nextCloneDate = new Date(lastClonedDate.getTime() + INTERVAL);
    const diffInSeconds = differenceInSeconds(nextCloneDate, new Date());

    // Convert seconds into hh:mm:ss format
    const hours = Math.floor(diffInSeconds / 3600);
    const minutes = Math.floor((diffInSeconds % 3600) / 60);
    const seconds = diffInSeconds % 60;

    // Format the ETA as hh:mm:ss
    const eta = `${String(hours).padStart(2, "0")}h:${String(minutes).padStart(
      2,
      "0"
    )}m:${String(seconds).padStart(2, "0")}s`;

    const healthStatus: Health = {
      lastCommit: JSON.parse(lastCommitDetails) as any,
      lastCloned: lastClonedDate.toISOString(),
      nextClone: nextCloneDate.toISOString(),
      eta: eta,
    };

    res.status(200).json(healthStatus);
  } catch (error) {
    res.status(500).json({ error: "Server error", details: error });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
