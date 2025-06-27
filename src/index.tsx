import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { Provider } from "react-redux";
import store from "./store/store";
import { AuthProvider } from "./context/AuthProvider";
import { BrowserRouter } from "react-router-dom";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { createTheme } from "@mui/material/styles";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);


const RootComponent = () => {
  return (
    <Provider store={store}>
      <AuthProvider>
        <React.Fragment>
          <BrowserRouter>
            <CssBaseline />
            <App />
          </BrowserRouter>
        </React.Fragment>
      </AuthProvider>
    </Provider>
  );
};

root.render(<RootComponent />);
