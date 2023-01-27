import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { Button, Alert } from "reactstrap";
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
import Loading from "../components/Loading";
import { authorized } from "../utils/authorization";
import { GetItems } from "../utils/api";
import { GetOrders } from "../utils/api";
import { Amplify, API } from "aws-amplify";
import awsconfig from "../aws-exports";

Amplify.configure(awsconfig);

export const OrdersComponent = () => {
  const [state, setState] = useState({
    authorized: true,
    showResult: false,
    products: "",
    orders: "",
    error: null,
  });

  const {
    getAccessTokenSilently,
    loginWithPopup,
    getAccessTokenWithPopup,
    user,
  } = useAuth0();

  const roles = user.anycompany_roles;

  const history = useHistory();

  const handleConsent = async () => {
    const token = await getAccessTokenSilently();
    try {
      await getAccessTokenWithPopup();
      setState({
        ...state,
        error: null,
        token: token,
      });
    } catch (error) {
      setState({
        ...state,
        error: error.error,
        token: token,
      });
    }

    await GetOrders(token, roles);
  };

  const handleLoginAgain = async () => {
    const token = await getAccessTokenSilently();
    try {
      await loginWithPopup();
      setState({
        ...state,
        error: null,
        token: token,
      });
    } catch (error) {
      setState({
        ...state,
        error: error.error,
        token: token,
      });
    }

    await GetOrders(token, roles);
  };

  const handle = (e, fn) => {
    e.preventDefault();
    fn();
  };

  const handleDelete = async (id) => {
    const token = await getAccessTokenSilently();
    const apiName = "ordersApi";
    const path = `/orders/object/${id}`;
    const myInit = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    try {
      if (authorized(roles, path, "DELETE")) {
        await API.del(apiName, path, myInit);
        await GetOrders(token, roles);
      } else {
        setState({
          ...state,
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
    (async () => {
      const token = await getAccessTokenSilently();
      const products = await GetItems(token, roles);
      const orders = await GetOrders(token, roles);
      setState({
        ...state,
        products: products.data,
        orders: orders.data,
        showResult: products.showResult && orders.showResult,
        authorized: products.authorized && orders.authorized,
        token: token,
      });
    })();
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
            You need to log in as an admin or wholesaler to access this resource
          </Alert>
        )}
        <h1>Orders Registry</h1>
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
                  <tr>
                    <td>
                      {
                        state.products.find(
                          (product) => product.product_id === item.product_id
                        ).productName
                      }
                    </td>
                    <td>{item.orderedBy}</td>
                    <td>{item.orderDate}</td>
                    <td>{item.quantity}</td>
                    <td>{item.unitCost}</td>
                    <td>{item.totalCost}</td>
                    <td>
                      <Button
                        color="primary"
                        onClick={() =>
                          history.push(`/orders/edit-order/${item.product_id}`)
                        }
                      >
                        Edit
                      </Button>
                      <Button
                        color="danger"
                        onClick={() => handleDelete(item.product_id)}
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