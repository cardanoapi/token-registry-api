import { FOLDER_NAME, LOCAL_DIR, REPO_NAME, REPO_OWNER } from ".";
import { cloneMappings } from "./utils";

export async function runClone() {
  const repoUrl = `https://github.com/${REPO_OWNER}/${REPO_NAME}.git`;
  const localDir = `./${LOCAL_DIR}`;

  try {
    await cloneMappings(repoUrl, FOLDER_NAME, localDir);
  } catch (err) {
    console.error("Failed to clone folder:", err);
  }
}
