// React page allowing to add a new item to the catalog and call the API to add it to the database
// Path: src/views/CatalogAdd.js

import React, { useState, useEffect } from "react";
import { Button, Alert } from "reactstrap";
import Highlight from "../components/Highlight";
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
import Loading from "../components/Loading";

export const CatalogAddComponent = () => {
    const apiOrigin =
        "https://g6i5cr5cjd.execute-api.us-east-2.amazonaws.com/dev";
    
    const [state, setState] = useState({
        data_sent: false,
        authorized: true,
        apiMessage: "",
        error: null,
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
    
    const postItem = async () => {
        try {
        const token = await getAccessTokenSilently();
        const response = await fetch(`${apiOrigin}/catalog`, {
            headers: {
            Authorization: `Bearer ${token}`,
            },
        });
        const responseData = await response.json();
        setState({
            ...state,
            data_sent: true,
            authorized: true,
            apiMessage: responseData.message,
        });
        }
        catch (error) {
        console.log(error);
        setState({
            ...state,
            data_fetched: true,
            authorized: false,
            showResult: true,
            apiMessage: error.message,
        });
        }
    };

    useEffect(() => {
        getItems();
    }
    , []);

    return (
        <>
      <div className="mb-5">
      {state.error === "consent_required" && (
          <Alert color="warning">
            You need to{" "}
            <a
              href="#/"
              class="alert-link"
              onClick={(e) => handle(e, handleConsent)}
            >
              consent to get access to users api
            </a>
          </Alert>
        )}
        {state.error === "login_required" && (
          <Alert color="warning">
            You need to{" "}
            <a
              href="#/"
              class="alert-link"
              onClick={(e) => handle(e, handleLoginAgain)}
            >
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
        <p className="lead">Add a new item to Widgets Catalog</p>
    </div>

    <div className="item-input-container">
        <div className="item-input">
            <label for="item-name">Item Name</label>
            <input type="text" id="item-name" name="item-name" />
        </div>
        <div className="item-input">
            <label for="item-description">Item Description</label>
            <input type="text" id="item-description" name="item-description" />
        </div>
        <div className="item-input">
            <label for="item-price">Item Price</label>
            <input type="text" id="item-price" name="item-price" />
        </div>
        <div className="item-input">
            <label for="item-quantity">Item Quantity</label>
            <input type="text" id="item-quantity" name="item-quantity" />
        </div>
        <div className="item-input">
            <label for="item-image">Item Image</label>
            <input type="text" id="item-image" name="item-image" />
        </div>
    </div>


