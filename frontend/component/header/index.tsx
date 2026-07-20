import { Button, Flex, Space, Tag, Typography } from "antd";
import { signIn, useSession } from "next-auth/react";
import { useEffect } from "react";
import { keycloakSessionLogOut, SessionData } from "../../utils/authUtils";

const { Text } = Typography;

const Header = () => {
  const { data, status } = useSession();
  const session = data as SessionData | null;
  const isAuthenticated = status === "authenticated";

  // A failed token refresh means the session can no longer be trusted — force a re-login.
  useEffect(() => {
    if (session?.error === "RefreshAccessTokenError") {
      keycloakSessionLogOut(session.id_token);
    }
  }, [session]);

  return (
    <Flex
      align="center"
      justify="space-between"
      style={{
        height: 56,
        padding: "0 24px",
        background: "#001529",
      }}
    >
      <Space size={12} align="center">
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 6,
            background: "#1677ff",
            color: "#fff",
            fontSize: 12,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          X26
        </div>
        <Flex vertical justify="center" style={{ lineHeight: 1.2 }}>
          <Text style={{ color: "#fff", fontSize: 15, fontWeight: 600 }}>
            Passenger Resource Management
          </Text>
          <Text style={{ color: "#8c9bb3", fontSize: 12 }}>
            Earth → Mars Settlement Mission
          </Text>
        </Flex>
      </Space>

      <Space align="center" size={12}>
        {isAuthenticated ? (
          <>
            <Text style={{ color: "#fff" }}>{session?.name || session?.username}</Text>
            {session?.roles?.map((role) => (
              <Tag color="blue" key={role}>
                {role}
              </Tag>
            ))}
            <Button onClick={() => keycloakSessionLogOut(session?.id_token)}>Logout</Button>
          </>
        ) : (
          <Button type="primary" onClick={() => signIn("keycloak")}>
            Login
          </Button>
        )}
      </Space>
    </Flex>
  );
};

export default Header;
