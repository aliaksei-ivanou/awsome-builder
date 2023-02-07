import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
import React, { useEffect, useState } from "react";
import { Alert, Button } from "reactstrap";
import Loading from "../components/Loading";
import { useApiWrapper } from "../utils/api";
import history from "../utils/history";
import { useAuth0ConsentWrapper } from "../utils/misc";

export const CatalogComponent = () => {
  const [state, setState] = useState({
    showResult: false,
    products: "",
    error: null,
    refresh: true,
  });

  const { handleConsent, handleLoginAgain, handle } = useAuth0ConsentWrapper();
  const { getItems, deleteData, getCookies } = useApiWrapper();
  const { user } = useAuth0();

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
    if (
      user.anycompany_roles.includes("Admin") ||
      user.anycompany_roles.includes("Wholesaler")
    ) {
      if (state.refresh) {
        const fetchData = async () => {
          const cookies = await getCookies();
          cookies.map(
            (cookie) =>
              (document.cookie = `${cookie.name}=${cookie.value}; path=/; expires=${cookie.expires}; secure;`)
          );

          const { data, showResult, error } = await getItems(
            user.anycompany_roles
          );
          setState((prevState) => {
            return {
              ...prevState,
              products: data,
              showResult,
              error,
              refresh: false,
            };
          });
        };
        fetchData();
      }
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
        {!(
          user.anycompany_roles.includes("Admin") ||
          user.anycompany_roles.includes("Wholesaler")
        ) && (
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
            {user.anycompany_roles.includes("Admin") && (
              <Button
                color="primary"
                onClick={() => history.push("/catalog/add-product")}
                style={{ float: "right" }}
              >
                Add Product
              </Button>
            )}
            <table className="table table-striped">
              <thead>
                <tr>
                  <th scope="col">Product Name</th>
                  <th scope="col">Product Description</th>
                  <th scope="col">Product Price</th>
                  <th scope="col">Product Quantity</th>
                  <th scope="col">Product Documentation</th>
                  {user.anycompany_roles.includes("Admin") && (
                    <th scope="col">Actions</th>
                  )}
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
                      <a href={`/files/${item.productDocumentation}`}>
                        {item.productDocumentation}
                      </a>
                    </td>
                    {user.anycompany_roles.includes("Admin") && (
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
                    )}
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
