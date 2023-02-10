import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
import React, { useEffect, useState } from "react";
import { Alert } from "reactstrap";
import Loading from "../components/Loading";
import { useApiWrapper } from "../utils/api";
import { useAuth0ConsentWrapper } from "../utils/misc";

export const CatalogComponent = () => {
  const [state, setState] = useState({
    showResult: false,
    products: "",
    error: null,
    refresh: true,
  });

  const { handleConsent, handleLoginAgain, handle } = useAuth0ConsentWrapper();
  const { getDocumentation, setCookies } = useApiWrapper();
  const { user } = useAuth0();

  useEffect(() => {
    if (state.refresh) {
      const fetchData = async () => {
        await setCookies();
        const { data, showResult, error } = await getDocumentation();
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
  }, [state.refresh, user.anycompany_roles, getDocumentation, setCookies]);

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
        <h1>Documentation</h1>
      </div>

      <div className="result-block-container">
        {state.showResult && (
          <div>
            <table className="table table-striped">
              <thead>
                <tr>
                  <th scope="col">Product Name</th>
                  <th scope="col">Product Description</th>
                  <th scope="col">Product Documentation</th>
                </tr>
              </thead>
              <tbody>
                {state.products.map((item) => (
                  <tr key={item.product_id}>
                    <td>{item.productName}</td>
                    <td>{item.productDescription}</td>
                    <td>
                      <a href={`/files/${item.productDocumentation}`}>
                        {item.productDocumentation}
                      </a>
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
