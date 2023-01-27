import { useAuth0 } from "@auth0/auth0-react";
import { Amplify, API } from "aws-amplify";
import awsconfig from "../aws-exports";

Amplify.configure(awsconfig);

export const useGetPresignedUrlWrapper = () => {
  const { getAccessTokenSilently } = useAuth0();

  const getPresignedUrl = async (fileName, action) => {
    const token = await getAccessTokenSilently();
    const apiName = "itemsApi";
    const path = "/items/sign-s3";
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    const body = {
      fileName,
      action,
    };

    try {
      const response = await API.post(apiName, path, { headers, body });
      console.log(`Received a signed request ${response.signedRequest}`);
      return response.signedRequest;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  const handleGetDocument = async (filename) => {
    const url = await getPresignedUrl(filename, "getObject");
    window.open(url);
  };

  return { getPresignedUrl, handleGetDocument };
};
