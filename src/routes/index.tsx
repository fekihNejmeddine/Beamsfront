import React, { Suspense, useContext } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import PersistLogin from "../components/PersistLogin/PersistLogin";
import RequireAuth from "../hooks/RequireAuth";
import RedirectIfLoggedIn from "../hooks/RedirectIfLoggedIn";
import routes, { AppRoute } from "./routes";
import Preloader from "../components/UI/Preloader";
import { ToastContainer } from "react-toastify";
import useAuth from "../hooks/useAuth";
import ROUTE from "../PATH/route";
import { LanguageContext } from "../context/LanguageContext";

const AppRouter: React.FC = () => {
  const { isRTL } = useContext(LanguageContext);

  return (
    <Suspense fallback={<Preloader />}>
      <PersistLogin>
        <Routes>
          {routes.map((route: AppRoute) => {
            let element = route.element;
            if (route.redirectIfAuth) {
              element = <RedirectIfLoggedIn>{element}</RedirectIfLoggedIn>;
            } else if (route.allowedRoles) {
              element = (
                <RequireAuth allowedRoles={route.allowedRoles}>
                  {element}
                </RequireAuth>
              );
            }
            return (
              <Route key={route.path} path={route.path} element={element} />
            );
          })}
        </Routes>

        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={isRTL}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          style={{ zIndex: 9999 }}
        />
      </PersistLogin>
    </Suspense>
  );
};

export default AppRouter;