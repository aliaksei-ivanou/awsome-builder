import React, { useState, useEffect } from "react";
import { Button, Alert } from "reactstrap";
import { getConfig } from "../config";
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
import Loading from "../components/Loading";

export const CatalogAddComponent = () => {
  const apiOrigin = getConfig().audience;

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
  };

  const handle = (e, fn) => {
    e.preventDefault();
    fn();
  };

  const postProduct = async () => {
    try {
      const token = await getAccessTokenSilently();
      // send POST request to the API
      const response = await fetch(`${apiOrigin}/catalog`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: document.getElementById("item-name").value,
          description: document.getElementById("item-description").value,
          price: document.getElementById("item-price").value,
          quantity: document.getElementById("item-quantity").value,
        }),
      });
      const responseData = await response.json();
      setState({
        ...state,
        data_sent: true,
        authorized: true,
        apiMessage: responseData.message,
      });
    } catch (error) {
      console.log(error);
      setState({
        ...state,
        data_fetched: true,
        authorized: false,
        showResult: true,
        apiMessage: error.message,
      });
    }
  };

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
        <p className="lead">Add a new Product to Widgets Catalog</p>
      </div>

      <div className="item-input-container">
        <div className="item-input">
          <label for="item-name" className="item-description">
            Product Name
          </label>
          <br />
          <input type="text" id="item-name" name="item-name" />
        </div>
        <div className="item-input">
          <label for="item-description" className="item-description">
            Product Description
          </label>
          <br />
          <input type="text" id="item-description" name="item-description" />
        </div>
        <div className="item-input">
          <label for="item-price" className="item-description">
            Product Price
          </label>
          <br />
          <input type="text" id="item-price" name="item-price" />
        </div>
        <div className="item-input">
          <label for="item-quantity" className="item-description">
            Product Quantity
          </label>
          <br />
          <input type="text" id="item-quantity" name="item-quantity" />
        </div>
        <div className="item-input">
          <label for="item-image" className="item-description">
            Product Image
          </label>
          <br />
          <input type="text" id="item-image" name="item-image" />
        </div>
      </div>
    </>
  );
};

export default withAuthenticationRequired(CatalogAddComponent, {
  onRedirecting: () => <Loading />,
});
