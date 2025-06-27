import { useNavigate } from "react-router-dom";
import axios from "axios";
import useAuth from "./useAuth";
import PATHS from "../PATH/apiPath";
import ROUTE from "../PATH/route"; 

const useLogout = (): (() => Promise<void>) => {
  const { setAuth } = useAuth();
  const navigate = useNavigate();

  const logout = async (): Promise<void> => {
    setAuth({});

    try {
      await axios.post(
        PATHS.AUTH.LOGOUT,
        {},
        {
          withCredentials: true,
        }
      );
    } catch (error) {
      console.error("Logout error:", error);
    }

    navigate(ROUTE.LOGIN, { replace: true });
  };

  return logout;
};

export default useLogout;
