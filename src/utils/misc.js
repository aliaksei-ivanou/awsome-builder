import { getPresignedUrl } from "../utils/s3";
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";

export const timeout = (delay) => new Promise((res) => setTimeout(res, delay));

export const handleDocument = async (token, filename) => {
  const url = await getPresignedUrl(filename, "getObject", token);
  window.open(url);
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
