import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

import { Auth0Provider } from "@auth0/auth0-react";

import { Amplify } from "aws-amplify";
import awsExports from "./aws-exports";
Amplify.configure(awsExports);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Auth0Provider
      domain="dev-56pajuydgx8hdw3g.us.auth0.com"
      clientId="xrdrGrLBmYuGKTqhgIzU98LyO2pApFI0"
      authorizationParams={{
        redirect_uri: window.location.origin,
      }}
    >
      <App />
    </Auth0Provider>
  </React.StrictMode>
);

reportWebVitals();
