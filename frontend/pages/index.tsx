import { useSession } from "next-auth/react";
import { Alert, Spin } from "antd";
import { SessionData } from "../utils/authUtils";
import CrewLeadDashboard from "../component/dashboard/CrewLeadDashboard";
import PassengerPortal from "../component/dashboard/PassengerPortal";

export default function Home() {
  const { data, status } = useSession();
  const session = data as SessionData | null;

  if (status === "loading") {
    return <Spin />;
  }

  if (status !== "authenticated" || !session) {
    return <Alert type="info" showIcon message="Signing in…" />;
  }

  if (session.roles?.includes("crew-lead")) {
    return <CrewLeadDashboard />;
  }

  if (session.roles?.includes("passenger")) {
    return <PassengerPortal />;
  }

  return (
    <Alert
      type="warning"
      showIcon
      message="No role assigned"
      description={
        <>
          Signed in as <code>{session.username}</code>, but this account isn't registered as a
          crew lead or passenger yet. Ask a crew lead to register you.
        </>
      }
    />
  );
}
