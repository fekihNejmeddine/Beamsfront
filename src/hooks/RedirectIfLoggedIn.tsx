import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import useAuth from "./useAuth";
import { boolean } from "yup";
import routes from "../routes/routes";

const RedirectIfLoggedIn = ({ children }) => {
  const { auth } = useAuth();
  const location = useLocation();
  useEffect(() => {
    const timer = setTimeout(() => {}, 1000);

    return () => clearTimeout(timer);
  }, []);
  
  const isAuthEmpty = Object.keys(auth).length === 0;

  if (!isAuthEmpty) {
    const previousLocation = location.state?.from?.pathname || "/";

    return <Navigate to={previousLocation} />;
  }

  return children;
};

export default RedirectIfLoggedIn;
