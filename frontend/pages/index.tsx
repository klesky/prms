import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { Alert, Card, Spin, Table, Tag, Typography } from "antd";
import { ResourceControllerService, ResourceDto } from "open-api";
import { SessionData } from "../utils/authUtils";

const { Title, Paragraph, Text } = Typography;

const levelColor: Record<string, string> = {
  SILVER: "default",
  GOLD: "gold",
  PLATINUM: "purple",
};

export default function Home() {
  const { data, status } = useSession();
  const session = data as SessionData | null;
  const isAuthenticated = status === "authenticated";

  const {
    data: resources,
    isLoading,
    isError,
    error,
  } = useQuery<ResourceDto[]>({
    queryKey: ["resources"],
    queryFn: () => ResourceControllerService.listResources(),
    enabled: isAuthenticated,
  });

  if (status === "loading") {
    return <Spin />;
  }

  return (
    <Typography>
      <Title level={3}>Welcome{session?.name ? `, ${session.name}` : ""}</Title>
      <Paragraph type="secondary">
        Signed in as <Text code>{session?.username}</Text>{" "}
        {session?.roles && session.roles.length > 0 ? (
          session.roles.map((r) => (
            <Tag color="blue" key={r}>
              {r}
            </Tag>
          ))
        ) : (
          <Tag>no domain role</Tag>
        )}
      </Paragraph>

      <Card
        title="Ship Resources (GET /api/resources)"
        style={{ marginTop: 16 }}
        styles={{ header: { fontWeight: 600 } }}
      >
        <Paragraph type="secondary">
          This call carries your Keycloak bearer token to the PRMS backend. A successful response
          (even an empty list) confirms end-to-end auth is working.
        </Paragraph>

        {isError ? (
          <Alert
            type="error"
            message="Request to backend failed"
            description={(error as Error)?.message}
            showIcon
          />
        ) : (
          <Table<ResourceDto>
            rowKey="id"
            loading={isLoading}
            dataSource={resources ?? []}
            pagination={false}
            columns={[
              { title: "Resource", dataIndex: "name", key: "name" },
              {
                title: "Min. Level",
                dataIndex: "minRequiredLevel",
                key: "minRequiredLevel",
                render: (level: string) => <Tag color={levelColor[level]}>{level}</Tag>,
              },
              { title: "ID", dataIndex: "id", key: "id" },
            ]}
          />
        )}
      </Card>
    </Typography>
  );
}
