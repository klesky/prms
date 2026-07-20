import { useSession } from "next-auth/react";
import { useQueries } from "@tanstack/react-query";
import { Alert, Card, Col, Row, Spin, Tag, Typography } from "antd";
import { PassengerControllerService, ResourceControllerService, ResourceDto } from "open-api";
import { SessionData } from "../../utils/authUtils";
import { membershipTagColor } from "../../utils/membership";

const { Title, Paragraph, Text } = Typography;

const PassengerPortal = () => {
  const { data } = useSession();
  const session = data as SessionData;

  const [allResourcesQuery, accessibleResourcesQuery] = useQueries({
    queries: [
      {
        queryKey: ["resources"],
        queryFn: () => ResourceControllerService.listResources(),
      },
      {
        queryKey: ["accessibleResources", session.username],
        queryFn: () =>
          PassengerControllerService.getAccessibleResources({ username: session.username! }),
        enabled: !!session.username,
      },
    ],
  });

  const isLoading = allResourcesQuery.isLoading || accessibleResourcesQuery.isLoading;
  const isError = allResourcesQuery.isError || accessibleResourcesQuery.isError;

  if (isLoading) {
    return <Spin />;
  }

  if (isError) {
    return <Alert type="error" showIcon message="Failed to load resources" />;
  }

  const accessibleIds = new Set((accessibleResourcesQuery.data ?? []).map((r) => r.id));

  return (
    <Typography>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
        <Title level={4} style={{ margin: 0 }}>
          {session.name || session.username}
        </Title>
        {session.membershipLevel && (
          <Tag color={membershipTagColor[session.membershipLevel]}>{session.membershipLevel}</Tag>
        )}
        <Text type="secondary">Access includes all lower tiers</Text>
      </div>

      <Row gutter={[14, 14]}>
        {(allResourcesQuery.data ?? []).map((resource: ResourceDto) => {
          const unlocked = accessibleIds.has(resource.id);
          return (
            <Col xs={24} sm={12} md={8} key={resource.id}>
              <Card size="small" style={{ opacity: unlocked ? 1 : 0.55 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <Text strong>{resource.name}</Text>
                  <Tag color={membershipTagColor[resource.minRequiredLevel]}>
                    {resource.minRequiredLevel}
                  </Tag>
                </div>
                {unlocked ? (
                  <Tag color="success">Accessible</Tag>
                ) : (
                  <div
                    style={{
                      fontSize: 12,
                      color: "#cf1322",
                      background: "#fff2f0",
                      borderRadius: 6,
                      padding: "6px 10px",
                      textAlign: "center",
                    }}
                  >
                    🔒 Requires {resource.minRequiredLevel}
                  </div>
                )}
              </Card>
            </Col>
          );
        })}
      </Row>

      {(allResourcesQuery.data ?? []).length === 0 && (
        <Paragraph type="secondary">No ship resources have been provisioned yet.</Paragraph>
      )}
    </Typography>
  );
};

export default PassengerPortal;
