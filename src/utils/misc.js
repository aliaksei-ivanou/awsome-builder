import { useAuth0 } from "@auth0/auth0-react";
import { useGetPresignedUrlWrapper } from "../utils/s3";

export const timeout = (delay) => new Promise((res) => setTimeout(res, delay));

export const useHandleDocumentWrapper = () => {
  const { getPresignedUrl } = useGetPresignedUrlWrapper();

  const handleDocument = async (filename) => {
    const url = await getPresignedUrl(filename, "getObject");
    window.open(url);
  };
  return { handleDocument };
};

export const useAuth0ConsentWrapper = () => {
  const { loginWithPopup, getAccessTokenWithPopup } = useAuth0();

  const handleConsent = async () => {
    try {
      await getAccessTokenWithPopup();
      return { error: null };
    } catch (error) {
      return { error: error.error };
    }
  };

  const handleLoginAgain = async () => {
    try {
      await loginWithPopup();
      return { error: null };
    } catch (error) {
      return { error: error.error };
    }
  };

  const handle = (e, fn) => {
    e.preventDefault();
    fn();
  };
  return { handleConsent, handleLoginAgain, handle };
};
