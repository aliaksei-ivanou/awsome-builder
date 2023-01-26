import React, { useState, useEffect } from "react";
import { Button, Alert } from "reactstrap";
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
import axios from "axios";
import Loading from "../components/Loading";
import { authorized } from "../utils/authorization";
import { GetPresignedUrl } from "../utils/s3";
import { Amplify, API } from "aws-amplify";
import awsconfig from "../aws-exports";

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

  const {
    getAccessTokenSilently,
    loginWithPopup,
    getAccessTokenWithPopup,
    user,
  } = useAuth0();

  const roles = user.anycompany_roles;

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
  };

  const handle = (e, fn) => {
    e.preventDefault();
    fn();
  };

  const handleDocument = async (filename) => {
    const token = await getAccessTokenSilently();
    await GetPresignedUrl(filename, "getObject", token).then((url) => {
      window.open(url);
    });
  };

  const getProduct = async () => {
    // split the path by / and get the last element
    const id = window.location.pathname.split("/").pop();
    const token = await getAccessTokenSilently();
    const apiName = "itemsApi";
    const path = `/items/object/${id}`;
    const myInit = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    try {
      if (authorized(roles, path, "GET")) {
        const response = await API.get(apiName, path, myInit);
        setState({
          ...state,
          authorized: true,
          name: response.productName,
          description: response.productDescription,
          price: response.productPrice,
          quantity: response.productQuantity,
          documentation: response.productDocumentation,
        });
      } else {
        setState({
          ...state,
          authorized: false,
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleUpload = async (file) => {
    const token = await getAccessTokenSilently();
    await GetPresignedUrl(file.name, "putObject", token)
      .then((signedRequest) => {
        console.log("Recieved a signed request " + signedRequest);
        var options = {
          headers: {
            "Content-Type": file.type,
          },
        };
        axios
          .put(signedRequest, file, options)
          .then((result) => {
            console.log("Response from s3");
            console.log(result);
            GetPresignedUrl(file.name, "getObject", token).then((url) => {
              setState({
                ...state,
                success: true,
                documentation: file.name,
                url: url,
              });
            });
          })
          .catch((error) => {
            console.log("ERROR " + error);
          });
      })
      .catch((error) => {
        console.log(error);
      });
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
      state.name === "" ||
      state.description === "" ||
      state.price === "" ||
      state.documentation === "" ||
      state.quantity === ""
    ) {
      setState({
        ...state,
        emptyFields: true,
        dataSent: false,
      });
      return;
    }
    try {
      if (authorized(roles, path, "POST")) {
        await API.post(apiName, path, myInit);
        setState({
          ...state,
          dataSent: true,
          authorized: true,
          emptyFields: false,
        });
      } else {
        setState({
          ...state,
          dataSent: false,
          authorized: false,
        });
      }
    } catch (error) {
      console.log(error);
      setState({
        ...state,
        data_fetched: true,
        showResult: true,
      });
    }
  };

  useEffect(() => {
    getProduct();
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
        {state.success && (
          <Alert color="success">
            The file is successfully uploaded. It can be accessed{" "}
            <a href={state.url}>here</a>
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
          <label>
            <a href="#/" onClick={(e) => handleDocument(state.documentation)}>
              {state.documentation}
            </a>
          </label>
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
