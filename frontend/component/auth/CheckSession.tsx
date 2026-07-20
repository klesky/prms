import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { OpenAPI } from "open-api";

/**
 * Side-effect-only component: mirrors the session's access token into the generated
 * OpenAPI client so API calls carry the bearer token without prop-drilling.
 */
const CheckSession = () => {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated" && session?.access_token) {
      OpenAPI.TOKEN = session.access_token;
    } else if (status === "unauthenticated") {
      OpenAPI.TOKEN = undefined;
    }
  }, [session, status]);

  return null;
};

export default CheckSession;
