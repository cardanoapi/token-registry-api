import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

/**
 * Clones a specific folder from a GitHub repository into a local folder using sparse checkout.
 *
 * @param repoUrl - The URL of the GitHub repository.
 * @param folderPath - The relative path of the folder in the repository you wish to clone.
 * @param localDir - The local directory where the folder should be cloned.
 */
export async function cloneMappings(
  repoUrl: string,
  folderName: string,
  localDir: string
): Promise<void> {
  try {
    await reset(localDir);
    console.log(`Cloning: ${repoUrl} into ${localDir}`);
    execSync(`git clone ${repoUrl} ${localDir}`);
    const lastCommitRaw = execSync(
      `git -C ${localDir} log -1 --pretty=format:"%H|%s|%an|%ad"`
    );
    const [commitHash, commitMessage, commitAuthor, commitDate] = lastCommitRaw
      .toString()
      .split("|");
    const lastCommit = {
      hash: commitHash,
      message: commitMessage,
      author: commitAuthor,
      date: commitDate,
    };
    keep(localDir, folderName);
    const timestamp = new Date().toISOString();
    const timestampFilePath = path.join(localDir, ".timestamp");
    await fs.promises.writeFile(timestampFilePath, timestamp);
    console.log(`Timestamp written to ${timestampFilePath}`);
    const lastCommitFilePath = path.join(localDir, ".commit");
    await fs.promises.writeFile(
      lastCommitFilePath,
      JSON.stringify(lastCommit, null, 2)
    );
    console.log(`Last commit details written to ${lastCommitFilePath}`);
  } catch (error) {
    console.error("Error cloning repository:", error);
    throw error;
  }
}

export async function reset(folderPath: string): Promise<void> {
  if (fs.existsSync(folderPath)) {
    await fs.promises.rm(folderPath, { recursive: true, force: true });
  }
  await fs.promises.mkdir(folderPath, { recursive: true });
}

async function keep(folderPath: string, folderName: string) {
  try {
    const folderNamePath = path.join(folderPath, folderName);
    const files = await fs.promises.readdir(folderPath);

    // Delete everything except folderName
    for (const file of files) {
      const filePath = path.join(folderPath, file);
      if (file !== folderName) {
        const stats = await fs.promises.stat(filePath);
        if (stats.isDirectory()) {
          await fs.promises.rm(filePath, { recursive: true, force: true });
        } else {
          await fs.promises.unlink(filePath);
        }
      }
    }

    const folderNameStats = await fs.promises.stat(folderNamePath);
    if (folderNameStats.isDirectory()) {
      const folderContents = await fs.promises.readdir(folderNamePath);
      for (const item of folderContents) {
        const itemPath = path.join(folderNamePath, item);
        const newItemPath = path.join(folderPath, item);
        await fs.promises.rename(itemPath, newItemPath);
      }
      await fs.promises.rm(folderNamePath, { recursive: true, force: true });
    }
  } catch (error) {
    console.error("Error processing folder:", error);
  }
}
