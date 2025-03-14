import axios, { AxiosResponse } from "axios";
import { apiError, APIError, handleApiError, isApiError } from "./handleError";
import { REPO_URL } from "./config";

export async function queryGithub(url: string, res: any) {
  const tokenRegistryResponse = await handleApiError(
    () => axios.get(url),
    `Querying Github: ${url}`
  );
  if (isApiError(tokenRegistryResponse)) {
    return res
      .status((tokenRegistryResponse as APIError).status)
      .send(tokenRegistryResponse);
  }
  return res.status(200).json((tokenRegistryResponse as AxiosResponse).data);
}

export async function githubHealth(res: any) {
  const startTime = performance.now();
  const urlParts = REPO_URL.split("/");
  const owner = urlParts[urlParts.length - 2];
  const repoName = urlParts[urlParts.length - 1].replace(".git", "");
  const apiUrl = `https://api.github.com/repos/${owner}/${repoName}/commits?per_page=1`;
  const response = await axios.get(apiUrl);
  const commitData = response.data[0];
  if (response.status !== 200) {
    const error = apiError(
      "Failed to fetch commit data",
      commitData.message,
      response.status
    );
    return res.status(error.status).json(error);
  }  
  const lastCommit = {
    hash: commitData.sha,
    message: commitData.commit.message,
    author: commitData.commit.author.name,
    date: commitData.commit.author.date,
  };

  const endTime = performance.now();
  const responseTime = (endTime - startTime).toFixed(2); // Time in milliseconds
  return res.status(200).json({
    lastCommit,
    responseTime: `${responseTime}ms`,
  });
}
