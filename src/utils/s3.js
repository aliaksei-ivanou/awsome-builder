import { Amplify, API } from "aws-amplify";
import awsconfig from "../aws-exports";

Amplify.configure(awsconfig);

export const GetPresignedUrl = async (fileName, action, token) => {
  const apiName = "itemsApi";
  const path = "/items/sign-s3";
  const myInit = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: {
      fileName: fileName,
      action: action,
    },
  };

  const response = await API.post(apiName, path, myInit);
  const signedRequest = response.signedRequest;
  console.log("Recieved a signed request " + signedRequest);
  return signedRequest;
};
