import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
import { Amplify } from "aws-amplify";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { Alert, Button } from "reactstrap";
import awsconfig from "../aws-exports";
import Loading from "../components/Loading";
import { useApiWrapper } from "../utils/api";
import { useAuth0ConsentWrapper } from "../utils/misc";
import { useGetPresignedUrlWrapper } from "../utils/s3";

Amplify.configure(awsconfig);

export const CatalogComponent = () => {
  const [state, setState] = useState({
    authorized: true,
    showResult: false,
    products: "",
    error: null,
    refresh: true,
  });

  const { handleConsent, handleLoginAgain, handle } = useAuth0ConsentWrapper();
  const { handleGetDocument } = useGetPresignedUrlWrapper();
  const { getItems, deleteData } = useApiWrapper();
  const { user } = useAuth0();

  const history = useHistory();

  const handleDelete = async (id) => {
    try {
      await deleteData(id, "itemsApi", "/items/object/");
      setState((prevState) => {
        return {
          ...prevState,
          refresh: true,
        };
      });
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
    if (state.refresh) {
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
            refresh: false,
          };
        });
      };
      fetchData();
    }
  }, [state.refresh, user.anycompany_roles, getItems]);

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
                            handleGetDocument(item.productDocumentation)
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
