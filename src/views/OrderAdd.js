import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
import { Amplify, API } from "aws-amplify";
import React, { useEffect, useState } from "react";
import { Alert, Button } from "reactstrap";
import awsconfig from "../aws-exports";
import Loading from "../components/Loading";
import { useApiWrapper } from "../utils/api";
import { authorized } from "../utils/authorization";
import { useAuth0ConsentWrapper } from "../utils/misc";

Amplify.configure(awsconfig);

export const CatalogAddComponent = () => {
  const [state, setState] = useState({
    authorized: true,
    dataSent: false,
    emptyFields: false,
    error: null,
    success: false,
    products: [],
    product: "",
    orderedBy: "",
    orderDate: "",
    quantity: "",
    unitCost: "",
    totalCost: "",
  });

  const { handleConsent, handleLoginAgain, handle } = useAuth0ConsentWrapper();
  const { getAccessTokenSilently, user } = useAuth0();
  const { getItems } = useApiWrapper();

  const postOrder = async () => {
    const token = await getAccessTokenSilently();
    const apiName = "itemsApi";
    const path = "/items";
    const myInit = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: {
        name: state.name,
        description: state.description,
        price: state.price,
        quantity: state.quantity,
        documentation: state.documentation,
      },
    };

    if (
      !state.name ||
      !state.description ||
      !state.price ||
      !state.documentation ||
      !state.quantity
    ) {
      setState((prevState) => {
        return {
          ...prevState,
          emptyFields: true,
          dataSent: false,
        };
      });
      return;
    }

    if (!authorized(user.anycompany_roles, path, "POST")) {
      setState((prevState) => {
        return {
          ...prevState,
          dataSent: false,
          authorized: false,
        };
      });
      return;
    }

    try {
      await API.post(apiName, path, myInit);
      setState((prevState) => {
        return {
          ...prevState,
          dataSent: true,
          authorized: true,
          emptyFields: false,
        };
      });
    } catch (error) {
      console.log(error);
      setState((prevState) => {
        return {
          ...prevState,
          data_fetched: true,
          showResult: true,
        };
      });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const { data, showResult, authorized, error } = await getItems(
        user.anycompany_roles
      );
      setState((prevState) => {
        return {
          ...prevState,
          products: data,
          showResult,
          authorized,
          error,
        };
      });
    };
    fetchData();
  }, []);

  return (
    <>
      <div className="mb-5">
        {state.error === "consent_required" && (
          <Alert color="warning">
            You need to{" "}
            <a href="#/" onClick={(e) => handle(e, handleConsent)}>
              consent to get access to users api
            </a>
          </Alert>
        )}
        {state.error === "login_required" && (
          <Alert color="warning">
            You need to{" "}
            <a href="#/" onClick={(e) => handle(e, handleLoginAgain)}>
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
          <Alert color="success">The order is successfully added</Alert>
        )}
        <h1>Orders</h1>
        <p className="lead">Add a new Order</p>
      </div>

      <div className="item-input-container">
        <div className="item-input">
          <label className="item-description">Product</label>
          <br />
          <select
            id="item-product"
            name="item-product"
            className="text-input"
            value={state.product}
            onChange={(e) => setState({ ...state, product: e.target.value })}
          >
            <option value="">Select a product</option>
            {state.products.map((product) => (
              <option key={product.product_id}>{product.productName}</option>
            ))}
          </select>
        </div>
        <div className="item-input">
          <label className="item-description">Quantity</label>
          <br />
          <label>
            Available to order:{" "}
            {state.products
              .filter((product) => product.productName === state.product)
              .map((product) => product.productQuantity)}
          </label>
          <br />
          <input
            type="number"
            id="item-quantity"
            name="item-quantity"
            className="text-input"
            value={state.quantity}
            onChange={(e) => {
              var min = 0;
              var max = state.products
                .filter((product) => product.productName === state.product)
                .map((product) => product.productQuantity);
              var value = parseInt(e.target.value, 10);
              if (value < min) {
                value = min;
              } else if (value > max) {
                value = max;
              }
              setState({ ...state, quantity: value });
            }}
          />
        </div>
        <div className="item-input">
          <label className="item-description">Unit Cost</label>
          <br />
          <label className="item-description">
            {state.products
              .filter((product) => product.productName === state.product)
              .map((product) => product.productPrice)}
          </label>
        </div>
        <div className="item-input">
          <label className="item-description">Total Cost</label>
          <br />
          <label className="item-description">
            {state.products
              .filter((product) => product.productName === state.product)
              .map((product) => product.productPrice) * state.quantity}
          </label>
        </div>
        <div className="item-input">
          <Button color="primary" className="btn-margin" onClick={postOrder}>
            Add Order
          </Button>
        </div>
      </div>
    </>
  );
};

export default withAuthenticationRequired(CatalogAddComponent, {
  onRedirecting: () => <Loading />,
});
