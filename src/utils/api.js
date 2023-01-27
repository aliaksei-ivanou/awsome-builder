import { useAuth0 } from "@auth0/auth0-react";
import { Amplify, API } from "aws-amplify";
import awsconfig from "../aws-exports";
import { authorized } from "../utils/authorization";

Amplify.configure(awsconfig);

export const useApiWrapper = () => {
  const { getAccessTokenSilently } = useAuth0();

  const getData = async (roles, apiName, path) => {
    const token = await getAccessTokenSilently();
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

  const getItems = async (roles) => getData(roles, "itemsApi", "/items");

  const getOrders = async (roles) => getData(roles, "ordersApi", "/orders");

  return { getItems, getOrders };
};
