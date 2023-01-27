import { GetPresignedUrl } from "../utils/s3";

export function timeout(delay) {
  return new Promise((res) => setTimeout(res, delay));
}

export const handleDocument = async (token, filename) => {
  await GetPresignedUrl(filename, "getObject", token).then((url) => {
    window.open(url);
  });
};
