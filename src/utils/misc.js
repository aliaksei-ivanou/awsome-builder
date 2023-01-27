import { getPresignedUrl } from "../utils/s3";

export const timeout = (delay) => new Promise((res) => setTimeout(res, delay));

export const handleDocument = async (token, filename) => {
  const url = await getPresignedUrl(filename, "getObject", token);
  window.open(url);
};
