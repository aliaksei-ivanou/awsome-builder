import { authorized } from "../utils/authorization";
import { Amplify, API } from "aws-amplify";
import awsconfig from "../aws-exports";

Amplify.configure(awsconfig);

const getData = async (token, roles, apiName, path) => {
  const state = {
    authorized: true,
    showResult: false,
    data: "",
    error: null,
  };

  const myInit = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  try {
    if (authorized(roles, path, "GET")) {
      const responseData = await API.get(apiName, path, myInit);
      state.showResult = true;
      state.data = responseData;
    } else {
      state.showResult = false;
      state.authorized = false;
    }
  } catch (error) {
    state.error = error.error;
  }

  return state;
};

export const GetItems = async (token, roles) =>
  getData(token, roles, "itemsApi", "/items");

export const GetOrders = async (token, roles) =>
  getData(token, roles, "ordersApi", "/orders");
