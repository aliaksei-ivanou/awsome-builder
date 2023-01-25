import React, { useState, useEffect } from "react";
import { Button, Alert } from "reactstrap";
import Highlight from "../components/Highlight";
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
import Loading from "../components/Loading";

export const CatalogComponent = () => {
  const apiOrigin =
    "https://g6i5cr5cjd.execute-api.us-east-2.amazonaws.com/dev";

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

  const authorized = () => {
    if (roles && roles.includes("Admin")) {
      return true;
    } else {
      return false;
    }
  };

  const getItems = async () => {
    try {
      if (authorized()) {
        console.log("User is authorized");
        const token = await getAccessTokenSilently();
        const response = await fetch(`${apiOrigin}/items`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const responseData = await response.json();
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

  const handle = (e, fn) => {
    e.preventDefault();
    fn();
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
        <p className="lead">Manage the catalog items.</p>
      </div>

      <div className="result-block-container">
        {state.showResult && (
          <div className="items-block">
            <Button
              color="primary"
              onClick={getItems}
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
            <h6 className="muted">Raw JSON</h6>
            <Highlight>
              <span>{JSON.stringify(state.apiMessage, null, 2)}</span>
            </Highlight>
          </div>
        )}
      </div>
    </>
  );
};

export default withAuthenticationRequired(CatalogComponent, {
  onRedirecting: () => <Loading />,
});
