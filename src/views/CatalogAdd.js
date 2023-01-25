import React, { useState } from "react";
import { Button, Alert } from "reactstrap";
import { getConfig } from "../config";
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
import Loading from "../components/Loading";
import { authorized } from "../utils/authorization";

export const CatalogAddComponent = () => {
  const apiOrigin = getConfig().audience;

  const [state, setState] = useState({
    authorized: true,
    dataSent: false,
    emptyFields: false,
    apiMessage: "",
    error: null,
    name: "",
    description: "",
    price: "",
    quantity: "",
    documentation: "",
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
    if (
      state.name === "" ||
      state.description === "" ||
      state.price === "" ||
      //   state.documentation === "" ||
      state.quantity === ""
    ) {
      setState({
        ...state,
        emptyFields: true,
        dataSent: false,
      });
      return;
    }
    const method = "POST";
    const path = "/items";
    try {
      if (authorized(roles, path, method)) {
        console.log("User is authorized");
        const token = await getAccessTokenSilently();
        const response = await fetch(`${apiOrigin}${path}`, {
          method: method,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: state.name,
            description: state.description,
            price: state.price,
            quantity: state.quantity,
            documentation: state.documentation,
          }),
        });
        const responseData = await response.json();
        setState({
          ...state,
          dataSent: true,
          authorized: true,
          apiMessage: responseData.message,
          emptyFields: false,
        });
      } else {
        console.log("User is not authorized");
        setState({
          ...state,
          dataSent: false,
          authorized: false,
        });
      }
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
        {state.emptyFields && (
          <Alert color="warning">Please fill all the fields</Alert>
        )}
        {state.dataSent && (
          <Alert color="success">The item is successfully added</Alert>
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
          <input
            type="text"
            id="item-name"
            name="item-name"
            className="text-input"
            value={state.name}
            onChange={(e) => setState({ ...state, name: e.target.value })}
          />
        </div>
        <div className="item-input">
          <label for="item-description" className="item-description">
            Product Description
          </label>
          <br />
          <textarea
            id="item-description"
            name="item-description"
            className="text-input"
            value={state.description}
            onChange={(e) =>
              setState({ ...state, description: e.target.value })
            }
          />
        </div>
        <div className="item-input">
          <label for="item-price" className="item-description">
            Product Price
          </label>
          <br />
          <input
            type="text"
            id="item-price"
            name="item-price"
            className="text-input"
            value={state.price}
            onChange={(e) => setState({ ...state, price: e.target.value })}
          />
        </div>
        <div className="item-input">
          <label for="item-quantity" className="item-description">
            Product Quantity
          </label>
          <br />
          <input
            type="text"
            id="item-quantity"
            name="item-quantity"
            className="text-input"
            value={state.quantity}
            onChange={(e) => setState({ ...state, quantity: e.target.value })}
          />
        </div>
        <div className="item-input">
          <label for="item-image" className="item-description">
            Product Documentation
          </label>
          <br />
          <input
            type="file"
            id="item-documentation"
            name="item-documentation"
            value={state.documentation}
            onChange={(e) =>
              setState({ ...state, documentation: e.target.value })
            }
          />
        </div>
        <div className="item-input">
          <Button color="primary" className="btn-margin" onClick={postProduct}>
            Add Product
          </Button>
        </div>
      </div>
    </>
  );
};

export default withAuthenticationRequired(CatalogAddComponent, {
  onRedirecting: () => <Loading />,
});
