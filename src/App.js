import React, { Component } from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import {
  Stitch,
  UserPasswordAuthProviderClient,
  UserPasswordCredential,
} from "mongodb-stitch-browser-sdk";

import Header from "./components/Header/Header";
import Modal from "./components/Modal/Modal";
import Backdrop from "./components/Backdrop/Backdrop";
import ProductsPage from "./pages/Product/Products";
import ProductPage from "./pages/Product/Product";
import EditProductPage from "./pages/Product/EditProduct";
import AuthPage from "./pages/Auth/Auth";
import ConfirmAccountPage from "./pages/Auth/ConfirmAccount";

class App extends Component {
  state = {
    isAuth: false,
    authMode: "login",
    error: null,
  };

  constructor() {
    super();
    this.client = Stitch.initializeDefaultAppClient("AbdelmounaimAzz-store");
    this.client.callFunction("demoFunction");
  }

  logoutHandler = () => {
    this.setState({ isAuth: false });
  };

  authHandler = (event, authData) => {
    event.preventDefault();
    if (authData.email.trim() === "" || authData.password.trim() === "") {
      return;
    }
    let request;
    const emailPassClient = this.client.auth.getProviderClient(
      UserPasswordAuthProviderClient.factory
    );
    if (this.state.authMode === "login") {
      const credential = new UserPasswordCredential(
        authData.email,
        authData.password
      );
      request = this.client.auth.loginWithCredential(credential);
    } else {
      request = emailPassClient.registerWithEmail(
        authData.email,
        authData.password
      );
    }

    request
      .then((result) => {
        console.log(result);
        if (result) {
          this.setState({ isAuth: true });
        }
      })
      .catch((err) => {
        this.errorHandler("Something went wrog");
        console.log(err);
        this.setState({ isAuth: false });
      });
  };

  authModeChangedHandler = () => {
    this.setState((prevState) => {
      return {
        authMode: prevState.authMode === "login" ? "signup" : "login",
      };
    });
  };

  errorHandler = (message) => {
    this.setState({
      error: message,
    });
  };

  render() {
    let routes = (
      <Switch>
        <Redirect from="/" to="/products" exact />
        <Redirect from="/auth" to="/products" exact />
        <Redirect from="/signup" to="/products" exact />
        <Route
          path="/product/:mode"
          render={(props) => (
            <EditProductPage {...props} onError={this.errorHandler} />
          )}
        />
        <Route
          path="/products/:id/:mode"
          render={(props) => (
            <EditProductPage {...props} onError={this.errorHandler} />
          )}
        />
        <Route
          path="/products/:id"
          render={(props) => (
            <ProductPage {...props} onError={this.errorHandler} />
          )}
        />
        <Route
          path="/products"
          render={(props) => (
            <ProductsPage {...props} onError={this.errorHandler} />
          )}
        />
      </Switch>
    );

    if (!this.state.isAuth) {
      routes = (
        <Switch>
          <Redirect from="/" to="/auth" exact />
          <Redirect from="/products" to="/auth" />
          <Redirect from="/product" to="/auth" />
          <Route path="/confirm-account" component={ConfirmAccountPage} />
          <Route
            path="/auth"
            render={() => (
              <AuthPage
                mode={this.state.authMode}
                onAuth={this.authHandler}
                onAuthModeChange={this.authModeChangedHandler}
              />
            )}
          />
        </Switch>
      );
    }

    return (
      <div className="App">
        <Modal
          open={!!this.state.error}
          title="Something went wrong"
          onClose={() => this.errorHandler(null)}
        >
          <p>{this.state.error}</p>
        </Modal>
        <Backdrop show={!!this.state.error} />
        <Header
          authenticated={this.state.isAuth}
          onLogout={this.logoutHandler}
        />
        {routes}
      </div>
    );
  }
}

export default App;
