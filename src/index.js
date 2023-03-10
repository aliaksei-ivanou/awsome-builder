import { Auth0Provider } from "@auth0/auth0-react";
import { Amplify } from "aws-amplify";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import awsExports from "./aws-exports";
import { getConfig } from "./config";
import * as serviceWorker from "./serviceWorker";
import history from "./utils/history";

import "./index.css";

Amplify.configure(awsExports);

const onRedirectCallback = (appState) => {
  history.push(
    appState && appState.returnTo ? appState.returnTo : window.location.pathname
  );
};

const config = getConfig();

const providerConfig = {
  domain: config.domain,
  clientId: config.clientId,
  onRedirectCallback,
  authorizationParams: {
    redirect_uri: window.location.origin,
    ...(config.audience ? { audience: config.audience } : null),
  },
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <Auth0Provider {...providerConfig}>
    <App />
  </Auth0Provider>
);

serviceWorker.unregister();
