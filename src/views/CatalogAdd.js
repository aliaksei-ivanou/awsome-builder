import React, { useState, useEffect } from "react";
import { Button, Alert } from "reactstrap";
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
import axios from "axios";
import Loading from "../components/Loading";
import { authorized } from "../utils/authorization";
import { handleDocument } from "../utils/misc";
import { getPresignedUrl } from "../utils/s3";
import { Amplify, API } from "aws-amplify";
import awsconfig from "../aws-exports";
import { useAuth0ConsentWrapper } from "../utils/misc";

Amplify.configure(awsconfig);

export const CatalogAddComponent = () => {
  const [state, setState] = useState({
    authorized: true,
    dataSent: false,
    emptyFields: false,
    error: null,
    success: false,
    url: "",
    name: "",
    description: "",
    price: "",
    quantity: "",
  });

  const { handleConsent, handleLoginAgain, handle } = useAuth0ConsentWrapper();

  const { getAccessTokenSilently, user } = useAuth0();

  const handleUpload = async (file) => {
    const token = await getAccessTokenSilently();
    try {
      const signedRequest = await getPresignedUrl(
        file.name,
        "putObject",
        token
      );
      const options = { headers: { "Content-Type": file.type } };
      await axios.put(signedRequest, file, options);
      setState({
        ...state,
        success: true,
        documentation: file.name,
        token: token,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const postProduct = async () => {
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
      setState({
        ...state,
        emptyFields: true,
        dataSent: false,
        token: token,
      });
      return;
    }

    if (!authorized(user.anycompany_roles, path, "POST")) {
      setState({
        ...state,
        dataSent: false,
        authorized: false,
        token: token,
      });
      return;
    }

    try {
      await API.post(apiName, path, myInit);
      setState({
        ...state,
        dataSent: true,
        authorized: true,
        emptyFields: false,
        token: token,
      });
    } catch (error) {
      console.log(error);
      setState({
        ...state,
        data_fetched: true,
        showResult: true,
        token: token,
      });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const token = await getAccessTokenSilently();
      setState({
        ...state,
        token,
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
          <Alert color="success">
            The product is successfully added to the catalog
          </Alert>
        )}
        <h1>Widgets Catalog</h1>
        <p className="lead">Add a new Product to Widgets Catalog</p>
      </div>

      <div className="item-input-container">
        <div className="item-input">
          <label className="item-description">Product Name</label>
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
          <label className="item-description">Product Description</label>
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
          <label className="item-description">Product Price</label>
          <br />
          <input
            type="number"
            id="item-price"
            name="item-price"
            className="text-input"
            value={state.price}
            onChange={(e) => setState({ ...state, price: e.target.value })}
          />
        </div>
        <div className="item-input">
          <label className="item-description">Product Quantity</label>
          <br />
          <input
            type="number"
            id="item-quantity"
            name="item-quantity"
            className="text-input"
            value={state.quantity}
            onChange={(e) => setState({ ...state, quantity: e.target.value })}
          />
        </div>
        <div className="item-input">
          <label className="item-description">Product Documentation</label>
          <br />
          <input
            type="file"
            id="item-documentation"
            name="item-documentation"
            onChange={(e) => handleUpload(e.target.files[0])}
          />
          {state.success && (
            <Alert color="success">
              The file is successfully uploaded:{" "}
              <a
                href="#/"
                onClick={(e) =>
                  handleDocument(state.token, state.documentation)
                }
              >
                {state.documentation}
              </a>
            </Alert>
          )}
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
