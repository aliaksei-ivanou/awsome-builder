import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
import { Amplify, API } from "aws-amplify";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { Alert, Button } from "reactstrap";
import awsconfig from "../aws-exports";
import Loading from "../components/Loading";
import { authorized } from "../utils/authorization";
import {
  timeout,
  useAuth0ConsentWrapper,
  useHandleDocumentWrapper,
} from "../utils/misc";
import { useGetPresignedUrlWrapper } from "../utils/s3";

Amplify.configure(awsconfig);

export const CatalogAddComponent = () => {
  const [state, setState] = useState({
    authorized: true,
    productUpdated: false,
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
  const { handleDocument } = useHandleDocumentWrapper();
  const { getAccessTokenSilently, user } = useAuth0();
  const { getPresignedUrl } = useGetPresignedUrlWrapper();

  const history = useHistory();

  const getProduct = async () => {
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
      if (!authorized(user.anycompany_roles, path, "GET")) {
        setState((prevState) => {
          return {
            ...prevState,
            authorized: false,
          };
        });
        return;
      }

      const response = await API.get(apiName, path, myInit);
      setState((prevState) => {
        return {
          ...prevState,
          authorized: true,
          name: response.productName,
          description: response.productDescription,
          price: response.productPrice,
          quantity: response.productQuantity,
          documentation: response.productDocumentation,
        };
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleUpload = async (file) => {
    try {
      const signedRequest = await getPresignedUrl(file.name, "putObject");
      const options = {
        headers: {
          "Content-Type": file.type,
        },
      };
      await axios.put(signedRequest, file, options);
      const url = await getPresignedUrl(file.name, "getObject");
      setState((prevState) => {
        return {
          ...prevState,
          success: true,
          documentation: file.name,
          url: url,
        };
      });
    } catch (error) {
      console.log(error);
    }
  };

  const updateProduct = async () => {
    const token = await getAccessTokenSilently();
    const apiName = "itemsApi";
    const path = "/items";
    const product_id = window.location.pathname.split("/").pop();
    const { name, description, price, quantity, documentation } = state;

    if (
      name === "" ||
      description === "" ||
      price === "" ||
      documentation === "" ||
      quantity === ""
    ) {
      setState((prevState) => {
        return {
          ...prevState,
          emptyFields: true,
          productUpdated: false,
        };
      });
      return;
    }

    const myInit = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: {
        product_id,
        name,
        description,
        price,
        quantity,
        documentation,
      },
    };

    try {
      if (authorized(user.anycompany_roles, path, "POST")) {
        await API.put(apiName, path, myInit);
        setState((prevState) => {
          return {
            ...prevState,
            productUpdated: true,
            authorized: true,
            emptyFields: false,
          };
        });
        // wait 2 seconds and redirect to catalog
        await timeout(2000);
        history.push("/catalog");
      } else {
        setState((prevState) => {
          return {
            ...prevState,
            productUpdated: false,
            authorized: false,
          };
        });
      }
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
        {state.productUpdated && (
          <Alert color="success">The product is successfully updated</Alert>
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
            onChange={(e) =>
              setState((prevState) => {
                return {
                  ...prevState,
                  name: e.target.value,
                };
              })
            }
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
              setState((prevState) => {
                return {
                  ...prevState,
                  description: e.target.value,
                };
              })
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
            onChange={(e) =>
              setState((prevState) => {
                return {
                  ...prevState,
                  price: e.target.value,
                };
              })
            }
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
            onChange={(e) =>
              setState((prevState) => {
                return {
                  ...prevState,
                  quantity: e.target.value,
                };
              })
            }
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
          <br />
          <label>
            <a href="#/" onClick={(e) => handleDocument(state.documentation)}>
              {state.documentation}
            </a>
          </label>
        </div>
        <div className="item-input">
          <Button
            color="primary"
            className="btn-margin"
            onClick={updateProduct}
          >
            Update Product
          </Button>
        </div>
      </div>
    </>
  );
};

export default withAuthenticationRequired(CatalogAddComponent, {
  onRedirecting: () => <Loading />,
});
