import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { Button, Alert } from "reactstrap";
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
import Loading from "../components/Loading";
import { authorized } from "../utils/authorization";
import { handleDocument } from "../utils/misc";
import { GetItems } from "../utils/api";
import { Amplify, API } from "aws-amplify";
import awsconfig from "../aws-exports";

Amplify.configure(awsconfig);

export const CatalogComponent = () => {
  const [state, setState] = useState({
    authorized: true,
    showResult: false,
    products: "",
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

    const result = await GetItems(state.token, roles);
    setState({
      ...state,
      products: result.products,
      showResult: result.showResult,
      authorized: result.authorized,
      error: result.error,
    });
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

    const result = await GetItems(state.token, roles);
    setState({
      ...state,
      products: result.products,
      showResult: result.showResult,
      authorized: result.authorized,
      error: result.error,
    });
  };

  const handle = (e, fn) => {
    e.preventDefault();
    fn();
  };

  const handleDelete = async (id) => {
    const token = await getAccessTokenSilently();
    const apiName = "itemsApi";
    const path = `/items/object/${id}`;
    const myInit = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    try {
      if (authorized(roles, path, "DELETE")) {
        await API.del(apiName, path, myInit);
        const result = await GetItems(state.token, roles);
        setState({
          ...state,
          products: result.products,
          showResult: result.showResult,
          authorized: result.authorized,
          error: result.error,
          token: token,
        });
      } else {
        setState({
          ...state,
          authorized: false,
          token: token,
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
      const result = await GetItems(token, roles);
      setState({
        ...state,
        products: result.products,
        showResult: result.showResult,
        authorized: result.authorized,
        error: result.error,
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
              onClick={() => history.push("/catalog/add-product")}
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
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {state.products.map((item) => (
                  <tr key={item.product_id}>
                    <td>{item.productName}</td>
                    <td>{item.productDescription}</td>
                    <td>{item.productPrice}</td>
                    <td>{item.productQuantity}</td>
                    <td>
                      <a
                        href="#/"
                        onClick={(e) =>
                          handleDocument(state.token, item.productDocumentation)
                        }
                      >
                        {item.productDocumentation}
                      </a>
                    </td>
                    <td>
                      <Button
                        color="primary"
                        onClick={() =>
                          history.push(
                            `/catalog/edit-product/${item.product_id}`
                          )
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

export default withAuthenticationRequired(CatalogComponent, {
  onRedirecting: () => <Loading />,
});
