import { useAuth0 } from "@auth0/auth0-react";
import { API } from "aws-amplify";

export const useApiWrapper = () => {
  const { getAccessTokenSilently } = useAuth0();

  const getData = async (apiName, path) => {
    const token = await getAccessTokenSilently();
    const state = {
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
      const responseData = await API.get(apiName, path, myInit);
      state.showResult = true;
      state.data = responseData;
    } catch (error) {
      console.log(error.error);
      state.error = error.error;
    }

    return state;
  };

  const getItems = async () => getData("itemsApi", "/items");

  const getOrders = async () => getData("ordersApi", "/orders");

  const getDocumentation = async () => getData("documentsApi", "/documents");

  const deleteData = async (id, apiName, path) => {
    try {
      const token = await getAccessTokenSilently();
      const headers = {
        Authorization: `Bearer ${token}`,
      };
      await API.del(apiName, path + id, { headers });
    } catch (error) {
      console.log(error.error);
    }
  };

  const getCookies = async () => {
    const token = await getAccessTokenSilently();
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    try {
      return await API.get("signedCookieApi", "/signed-cookie", { headers });
    } catch (error) {
      console.log(error.error);
    }
  };

  return { getItems, getOrders, getDocumentation, deleteData, getCookies };
};
