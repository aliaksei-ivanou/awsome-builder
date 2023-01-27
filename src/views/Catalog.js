import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { Button, Alert } from "reactstrap";
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
import Loading from "../components/Loading";
import { authorized } from "../utils/authorization";
import { useApiWrapper } from "../utils/api";
import { Amplify, API } from "aws-amplify";
import awsconfig from "../aws-exports";
import { useAuth0ConsentWrapper } from "../utils/misc";
import { useHandleDocumentWrapper } from "../utils/misc";
Amplify.configure(awsconfig);

export const CatalogComponent = () => {
  const [state, setState] = useState({
    authorized: true,
    showResult: false,
    products: "",
    error: null,
  });

  const { handleConsent, handleLoginAgain, handle } = useAuth0ConsentWrapper();
  const { handleDocument } = useHandleDocumentWrapper();
  const { getItems } = useApiWrapper();
  const { getAccessTokenSilently, user } = useAuth0();

  const history = useHistory();

  const handleDelete = async (id) => {
    try {
      const token = await getAccessTokenSilently();
      const apiName = "itemsApi";
      const path = `/items/object/${id}`;
      const headers = {
        Authorization: `Bearer ${token}`,
      };
      const authorizedToDelete = authorized(
        user.anycompany_roles,
        path,
        "DELETE"
      );
      if (authorizedToDelete) {
        await API.del(apiName, path, { headers });
        const { data, showResult, authorized, error } = await getItems(
          user.anycompany_roles
        );
        setState({
          ...state,
          products: data,
          showResult,
          authorized,
          error,
        });
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
    const fetchData = async () => {
      const { data, showResult, authorized, error } = await getItems(
        user.anycompany_roles
      );
      setState({
        ...state,
        products: data,
        showResult,
        authorized,
        error,
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
                          handle(e, () =>
                            handleDocument(item.productDocumentation)
                          )
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
