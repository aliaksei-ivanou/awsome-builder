import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
import { API } from "aws-amplify";
import React, { useEffect, useState } from "react";
import { Alert, Button } from "reactstrap";
import Loading from "../components/Loading";
import { useApiWrapper } from "../utils/api";
import history from "../utils/history";
import { useAuth0ConsentWrapper } from "../utils/misc";

export const OrdersComponent = () => {
  const [state, setState] = useState({
    showResult: false,
    products: "",
    orders: "",
    error: null,
    refresh: true,
  });

  const { handleConsent, handleLoginAgain, handle } = useAuth0ConsentWrapper();
  const { getItems, getOrders } = useApiWrapper();
  const { getAccessTokenSilently, user } = useAuth0();

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
        quantity:
          state.products.find((product) => product.product_id === product_id)
            .productQuantity + quantity,
        documentation: state.products.find(
          (product) => product.product_id === product_id
        ).productDocumentation,
      },
    };
    await API.put(apiName, path, myInit);
  };

  const handleDelete = async (order_id, product_id, quantity) => {
    const token = await getAccessTokenSilently();
    const apiName = "ordersApi";
    const path = `/orders/object/${order_id}/${product_id}`;
    const myInit = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    try {
      await API.del(apiName, path, myInit);
      setState((prevState) => {
        return {
          ...prevState,
          refresh: true,
        };
      });
      await updateProduct(product_id, quantity);
    } catch (error) {
      setState((prevState) => {
        return {
          ...prevState,
          error: error.error,
        };
      });
    }
  };

  useEffect(() => {
    if (
      user.anycompany_roles.includes("Admin") ||
      user.anycompany_roles.includes("Wholesaler")
    ) {
      if (state.refresh) {
        const fetchData = async () => {
          const products = await getItems(user.anycompany_roles);
          const orders = await getOrders(user.anycompany_roles);
          setState((prevState) => {
            return {
              ...prevState,
              products: products.data,
              orders: orders.data,
              showResult: products.showResult && orders.showResult,
              refresh: false,
            };
          });
        };
        fetchData();
      }
    }
  }, [state.refresh, user.anycompany_roles, getItems, getOrders]);

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
            You need to log in as an admin or wholesaler to access this resource
          </Alert>
        )}
        <h1>Orders</h1>
        <p className="lead">Manage orders</p>
      </div>

      <div className="result-block-container">
        {state.showResult && (
          <div>
            <Button
              color="primary"
              onClick={() => history.push("/orders/add-order")}
              style={{ float: "right" }}
            >
              Add Order
            </Button>
            <table className="table table-striped">
              <thead>
                <tr>
                  <th scope="col">Product Name</th>
                  <th scope="col">Ordered By</th>
                  <th scope="col">Order Date</th>
                  <th scope="col">Quantity</th>
                  <th scope="col">Unit Cost</th>
                  <th scope="col">Total Cost</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {state.orders.map((item) => (
                  <tr key={item.order_id}>
                    <td>{item.productName}</td>
                    <td>{item.orderedBy}</td>
                    <td>{item.orderDate}</td>
                    <td>{item.quantity}</td>
                    <td>{item.unitCost}</td>
                    <td>{item.totalCost}</td>
                    <td>
                      <Button
                        color="danger"
                        onClick={() =>
                          handleDelete(
                            item.order_id,
                            item.product_id,
                            item.quantity
                          )
                        }
                      >
                        Delete
                      </Button>
                    </td>
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

export default withAuthenticationRequired(OrdersComponent, {
  onRedirecting: () => <Loading />,
});
