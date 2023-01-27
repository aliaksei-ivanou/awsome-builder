import { authorized } from "../utils/authorization";
import { Amplify, API } from "aws-amplify";
import awsconfig from "../aws-exports";

Amplify.configure(awsconfig);

export const GetItems = async (token, roles) => {
  const state = {
    authorized: true,
    showResult: false,
    apiMessage: "",
    error: null,
  };

  const apiName = "itemsApi";
  const path = "/items";
  const myInit = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  try {
    if (authorized(roles, path, "GET")) {
      const responseData = await API.get(apiName, path, myInit);
      state.showResult = true;
      state.apiMessage = responseData;
    } else {
      state.showResult = false;
      state.authorized = false;
    }
  } catch (error) {
    state.error = error.error;
  }

  return state;
};
