import { useAuth0 } from "@auth0/auth0-react";
import React from "react";
import { Route, Router, Switch } from "react-router-dom";
import { Container } from "reactstrap";
import Footer from "./components/Footer";
import Loading from "./components/Loading";
import NavBar from "./components/NavBar";
import history from "./utils/history";
import Catalog from "./views/Catalog";
import CatalogAdd from "./views/CatalogAdd";
import CatalogEdit from "./views/CatalogEdit";
import Documentation from "./views/Documentation";
import Home from "./views/Home";
import OrderAdd from "./views/OrderAdd";
import Orders from "./views/Orders";
import Profile from "./views/Profile";

// styles
import "./App.css";

// fontawesome
import initFontAwesome from "./utils/initFontAwesome";

initFontAwesome();

const App = () => {
  const { isLoading, error } = useAuth0();

  if (error) {
    return <div>Oops... {error.message}</div>;
  }

  if (isLoading) {
    return <Loading />;
  }

  return (
    <Router history={history}>
      <div id="app" className="d-flex flex-column h-100">
        <NavBar />
        <Container className="flex-grow-1 mt-5">
          <Switch>
            <Route path="/" exact component={Home} />
            <Route path="/profile" component={Profile} />
            <Route path="/catalog" exact component={Catalog} />
            <Route path="/catalog/add-product" exact component={CatalogAdd} />
            <Route path="/catalog/edit-product" component={CatalogEdit} />
            <Route path="/orders" exact component={Orders} />
            <Route path="/orders/add-order" exact component={OrderAdd} />
            <Route path="/documentation" exact component={Documentation} />
          </Switch>
        </Container>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
