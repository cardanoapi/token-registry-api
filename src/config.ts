require("dotenv").config();

export const REPO_OWNER = "cardano-foundation";
export const REPO_NAME = "cardano-token-registry";
export const BRANCH_NAME = "master";
export const FOLDER_NAME = "mappings";
export const LOCAL_DIR = "offchain-metadata";
export const REPO_URL = `https://github.com/${REPO_OWNER}/${REPO_NAME}.git`;
export const DAYS = 2;
export const INTERVAL = DAYS * 24 * 60 * 60 * 1000;

export const port = process.env.SERVER_PORT ? process.env.SERVER_PORT : 8080;
export const scheduleUpdate = process.env.SCHEDULE_UPDATE
  ? process.env.SCHEDULE_UPDATE === "true"
  : false;
export const useGithub = process.env.USE_GH_API
  ? process.env.USE_GH_API === "true"
  : false;
