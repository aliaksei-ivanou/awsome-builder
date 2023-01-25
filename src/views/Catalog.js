import React, { useState, useEffect } from "react";
import { Button, Alert } from "reactstrap";
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
import Loading from "../components/Loading";
import { authorized } from "../utils/authorization";
import { Amplify, API } from "aws-amplify";
import awsconfig from "../aws-exports";

Amplify.configure(awsconfig);

export const CatalogComponent = () => {
  const [state, setState] = useState({
    authorized: true,
    showResult: false,
    apiMessage: "",
    error: null,
  });

  const {
    getAccessTokenSilently,
    loginWithPopup,
    getAccessTokenWithPopup,
    user,
  } = useAuth0();

  const roles = user.anycompany_roles;

  const handleConsent = async () => {
    try {
      await getAccessTokenWithPopup();
      setState({
        ...state,
        error: null,
      });
    } catch (error) {
      setState({
        ...state,
        error: error.error,
      });
    }

    await getItems();
  };

  const handleLoginAgain = async () => {
    try {
      await loginWithPopup();
      setState({
        ...state,
        error: null,
      });
    } catch (error) {
      setState({
        ...state,
        error: error.error,
      });
    }

    await getItems();
  };

  const handle = (e, fn) => {
    e.preventDefault();
    fn();
  };

  const getItems = async () => {
    const token = await getAccessTokenSilently();
    const apiName = "itemsApi";
    const path = "/items";
    const myInit = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    try {
      if (authorized(roles, path, "GET")) {
        console.log("User is authorized");
        const responseData = await API.get(apiName, path, myInit);
        setState({
          ...state,
          showResult: true,
          apiMessage: responseData,
        });
      } else {
        console.log("User is not authorized");
        setState({
          ...state,
          showResult: false,
          authorized: false,
        });
      }
    } catch (error) {
      setState({
        ...state,
        error: error.error,
      });
    }
  };

  useEffect(() => {
    getItems();
  }, []);

  return (
    <>
      <div className="mb-5">
        {state.error === "consent_required" && (
          <Alert color="warning">
            You need to{" "}
            <a
              href="#/"
              class="alert-link"
              onClick={(e) => handle(e, handleConsent)}
            >
              consent to get access to users api
            </a>
          </Alert>
        )}
        {state.error === "login_required" && (
          <Alert color="warning">
            You need to{" "}
            <a
              href="#/"
              class="alert-link"
              onClick={(e) => handle(e, handleLoginAgain)}
            >
              log in again
            </a>
          </Alert>
        )}
        {!state.authorized && (
          <Alert color="warning">
            You need to log in as an admin to access this resource
          </Alert>
        )}
        <h1>Widgets Catalog</h1>
        <p className="lead">Manage the catalog items</p>
      </div>

      <div className="result-block-container">
        {state.showResult && (
          <div>
            <Button
              color="primary"
              onClick={() => (window.location.href = "/catalog/add-product")}
              style={{ float: "right" }}
            >
              Add Product
            </Button>
            <table className="table table-striped">
              <thead>
                <tr>
                  <th scope="col">Product Name</th>
                  <th scope="col">Product Description</th>
                  <th scope="col">Product Price</th>
                  <th scope="col">Product Quantity</th>
                  <th scope="col">Product Documentation</th>
                </tr>
              </thead>
              <tbody>
                {state.apiMessage.map((item) => (
                  <tr>
                    <td>{item.productName}</td>
                    <td>{item.productDescription}</td>
                    <td>{item.productPrice}</td>
                    <td>{item.productQuantity}</td>
                    <td>{item.productDocumentation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default withAuthenticationRequired(CatalogComponent, {
  onRedirecting: () => <Loading />,
});
