import { useAuth0 } from "@auth0/auth0-react";
import { API } from "aws-amplify";
import axios from "axios";

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

  const handleUploadDocument = async (file) => {
    try {
      const signedRequest = await getPresignedUrl(file.name, "putObject");
      const options = { headers: { "Content-Type": file.type } };
      await axios.put(signedRequest, file, options);
      return {
        success: true,
        documentation: file.name,
        error: null,
      };
    } catch (error) {
      console.log(error);
      return {
        success: false,
        documentation: null,
        error: error,
      };
    }
  };

  return { handleUploadDocument };
};
