import path from "path";
import fs from "fs";
import { INTERVAL, LOCAL_DIR, scheduleUpdate } from "./config";
import { differenceInSeconds } from "date-fns";

type Health = {
  lastCommit: {
    hash: string;
    message: string;
    author: string;
    date: string;
  }; // last commit details. read from LOCAL_DIR/.commit file
  lastCloned: string; // read this from LOCAL_DIR/.timestamp file
  nextClone?: string; // add INTERVAL milliseconds to the timestamp file and create a date object .toISOstring()
  eta?: string; // calculate the hours:minutes:seconds between current and next time
};

export async function queryCache(localDir: string, id: string, res: any) {
  const filePath = path.join(localDir, `${id}.json`);
  fs.promises
    .stat(filePath)
    .then(() => {
      fs.promises
        .readFile(filePath, "utf-8")
        .then((content) => {
          res.status(200).json(JSON.parse(content));
        })
        .catch((readError) => {
          res.status(500).json({
            error: "Error reading the file content",
            details: readError,
          });
        });
    })
    .catch(() => {
      res
        .status(404)
        .json({ message: `File for id '${id}' not found`, status: 404 });
    });
}

export async function cacheHealth(res: any) {
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
  const timestampData = await fs.promises.readFile(timestampFilePath, "utf-8");
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
  const nextCloneAndEta = scheduleUpdate
    ? {
        nextClone: nextCloneDate.toISOString(),
        eta: eta,
      }
    : {};
  const healthStatus: Health = {
    lastCommit: JSON.parse(lastCommitDetails) as any,
    lastCloned: lastClonedDate.toISOString(),
    ...nextCloneAndEta,
  };
  res.status(200).json(healthStatus);
}
