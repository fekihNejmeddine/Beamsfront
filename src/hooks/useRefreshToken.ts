import PATHS from "../PATH/apiPath";
import useAuth from "./useAuth";
import axios from "axios";
const useRefreshToken = () => {
  const { setAuth } = useAuth();

  const refresh = async () => {
    const response = await axios.get(PATHS.AUTH.REFRESH_TOKEN, {
      withCredentials: true,
    });
    console.log("response::::::::::",response)
    setAuth((prev) => {
      return {
        ...prev,
        user: response.data.user,
        accessToken: response.data.token,
        role:response.data.user.role
      };
    });
    return response.data.token;
  };

  return refresh;
};

export default useRefreshToken;
