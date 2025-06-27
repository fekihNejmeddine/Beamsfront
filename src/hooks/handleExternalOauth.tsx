import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import useRefreshToken from "./useRefreshToken";

const HandleExternalOauth: React.FC = () => {
  const queryParams = new URLSearchParams(window.location.search);
  const from = queryParams.get("from") || "/";

  const navigate = useNavigate();
  const refresh = useRefreshToken();

  useEffect(() => {
    const token = async () => {
      await refresh();
      navigate(from, { replace: true });
    };
    token();
  }, [from, navigate, refresh]);

  return null;
};

export default HandleExternalOauth;
