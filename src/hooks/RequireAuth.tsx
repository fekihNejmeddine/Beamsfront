import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import useAuth from "./useAuth";
import ROUTE from "../PATH/route";
import routes from "../routes/routes";

interface RequireAuthProps {
  allowedRoles: string[];
  children: React.ReactNode;
}

const RequireAuth: React.FC<RequireAuthProps> = ({ allowedRoles, children }) => {
  const { auth } = useAuth();
  const location = useLocation();

  const accessToken = auth?.accessToken;
  const userRole = auth?.user?.role;

  // 1. Vérifier si l'utilisateur est connecté
  if (!accessToken) {
    return <Navigate to={ROUTE.LOGIN} state={{ from: location }} replace />;
  }

  // 2. Vérifier si l'utilisateur a un rôle autorisé
  if (!userRole || !allowedRoles.includes(userRole)) {
    const fallbackRoute = routes.findLast((route) =>
      route.allowedRoles?.includes(userRole)
    );

    return (
      <Navigate
        to={fallbackRoute?.path || ROUTE.ERROR_403}
        state={{ from: location }}
        replace
      />
    );
  }

  // 3. Utilisateur connecté et autorisé → affichage du contenu
  return <>{children}</>;
};

export default RequireAuth;
