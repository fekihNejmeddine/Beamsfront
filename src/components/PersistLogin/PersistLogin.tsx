import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import useRefreshToken from "../../hooks/useRefreshToken";
import useAuth from "../../hooks/useAuth";

// Define prop types for PersistLogin component
interface PersistLoginProps {
  children: React.ReactNode;
}

const PersistLogin: React.FC<PersistLoginProps> = (props) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const refresh = useRefreshToken();
  const { auth } = useAuth();
  const location = useLocation();
const a = isLoading;
  console.log(a)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location]);

  useEffect(() => {
    let isMounted = true;

    const verifyRefreshToken = async () => {
      try {
        await refresh();
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    // Check if we need to refresh token based on conditions
    if ((!auth?.accessToken )) {
      verifyRefreshToken();
    } else {
      setIsLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [auth?.accessToken,refresh]);

  return <>{props.children}</>;
};

export default PersistLogin;
