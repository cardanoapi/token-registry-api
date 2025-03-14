import axios, { AxiosResponse } from "axios";
import { APIError, handleApiError, isApiError } from "./handleError";

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
