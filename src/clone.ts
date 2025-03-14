import { FOLDER_NAME, LOCAL_DIR, REPO_URL } from "./config";
import { cloneMappings } from "./utils";

export async function runClone() {
  try {
    await cloneMappings(REPO_URL, FOLDER_NAME, LOCAL_DIR);
  } catch (err) {
    console.error("Failed to clone folder:", err);
  }
}
