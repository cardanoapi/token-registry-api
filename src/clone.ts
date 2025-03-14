import { cloneMappings } from "./utils";

export async function runClone(repoUrl: string, localDir:string, folderName: string) {
  try {
    await cloneMappings(repoUrl, folderName, localDir);
  } catch (err) {
    console.error("Failed to clone folder:", err);
  }
}
