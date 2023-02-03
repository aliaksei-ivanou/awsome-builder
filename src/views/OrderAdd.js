import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
import { Amplify, API } from "aws-amplify";
import React, { useEffect, useState } from "react";
import { Alert, Button } from "reactstrap";
import awsconfig from "../aws-exports";
import Loading from "../components/Loading";
import { useApiWrapper } from "../utils/api";
import { useAuth0ConsentWrapper } from "../utils/misc";

Amplify.configure(awsconfig);

export const CatalogAddComponent = () => {
  const [state, setState] = useState({
    dataSent: false,
    emptyFields: false,
    error: null,
    success: false,
    showForm: false,
    products: [],
    product: "",
    quantity: "",
  });

  const { handleConsent, handleLoginAgain, handle } = useAuth0ConsentWrapper();
  const { getAccessTokenSilently, user } = useAuth0();
  const { getItems } = useApiWrapper();

  const updateProduct = async (product_id, quantity) => {
    const token = await getAccessTokenSilently();
    const apiName = "itemsApi";
    const path = "/items";

    const myInit = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: {
        product_id,
        name: state.products.find(
          (product) => product.product_id === product_id
        ).productName,
        description: state.products.find(
          (product) => product.product_id === product_id
        ).productDescription,
        price: state.products.find(
          (product) => product.product_id === product_id
        ).productPrice,
        quantity,
        documentation: state.products.find(
          (product) => product.product_id === product_id
        ).productDocumentation,
      },
    };
    await API.put(apiName, path, myInit);
  };

  const postOrder = async () => {
    const token = await getAccessTokenSilently();
    const apiName = "ordersApi";
    const path = "/orders";
    const productId = state.products.find(
      (product) => product.productName === state.product
    ).product_id;
    const myInit = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: {
        productId: productId,
        productName: state.product,
        orderedBy: user.name,
        orderDate: new Date().toISOString().slice(0, 19).replace("T", " "),
        quantity: state.quantity,
        price: state.products.find(
          (product) => product.productName === state.product
        ).productPrice,
        totalCost: parseFloat(
          state.products.find(
            (product) => product.productName === state.product
          ).productPrice * state.quantity
        ).toFixed(2),
      },
    };

    if (!state.product || !state.quantity) {
      setState((prevState) => {
        return {
          ...prevState,
          emptyFields: true,
          dataSent: false,
        };
      });
      return;
    }

    try {
      await API.post(apiName, path, myInit);
      await updateProduct(
        productId,
        state.products.find((product) => product.productName === state.product)
          .productQuantity - state.quantity
      );
      setState((prevState) => {
        return {
          ...prevState,
          dataSent: true,
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
    if (
      user.anycompany_roles.includes("Admin") ||
      user.anycompany_roles.includes("Wholesaler")
    ) {
      const fetchData = async () => {
        const { data, showResult, error } = await getItems(
          user.anycompany_roles
        );
        setState((prevState) => {
          return {
            ...prevState,
            products: data,
            showResult,
            error,
            showForm: true,
          };
        });
      };
      fetchData();
    }
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
        {!(
          user.anycompany_roles.includes("Admin") ||
          user.anycompany_roles.includes("Wholesaler")
        ) && (
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
        {state.showForm && (
          <>
            <div className="item-input">
              <label className="item-description">Product</label>
              <br />
              <select
                id="item-product"
                name="item-product"
                className="text-input"
                value={state.product}
                onChange={(e) =>
                  setState({ ...state, product: e.target.value })
                }
              >
                <option value="">Select a product</option>
                {state.products.map((product) => (
                  <option key={product.product_id}>
                    {product.productName}
                  </option>
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
                {parseFloat(
                  state.products
                    .filter((product) => product.productName === state.product)
                    .map((product) => product.productPrice) * state.quantity
                ).toFixed(2) || 0}
              </label>
            </div>
            <div className="item-input">
              <Button
                color="primary"
                className="btn-margin"
                onClick={postOrder}
              >
                Add Order
              </Button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default withAuthenticationRequired(CatalogAddComponent, {
  onRedirecting: () => <Loading />,
});
