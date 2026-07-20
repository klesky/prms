import { useState } from "react";
import { useSession } from "next-auth/react";
import { useMutation, useQueries } from "@tanstack/react-query";
import { Alert, Button, Card, Col, Row, Spin, Tag, Typography, message } from "antd";
import { HistoryOutlined, LockOutlined, ThunderboltOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { PassengersService, ResourcesService, ResourceDto, UsageLogDto, UsageLogsService } from "open-api";
import { SessionData } from "../../utils/authUtils";
import { membershipTagColor } from "../../utils/membership";
import { getApiErrorMessage } from "../../utils/apiError";

const { Title, Paragraph, Text } = Typography;

const PassengerPortal = () => {
  const { data } = useSession();
  const session = data as SessionData;

  const [allResourcesQuery, accessibleResourcesQuery] = useQueries({
    queries: [
      {
        queryKey: ["resources"],
        queryFn: () => ResourcesService.listResources(),
      },
      {
        queryKey: ["accessibleResources", session.username],
        queryFn: () =>
          PassengersService.getAccessibleResources({ username: session.username! }),
        enabled: !!session.username,
      },
    ],
  });

  // Session-only: the backend has no endpoint to read usage history back, so this list
  // only reflects "Use Now" clicks made in this browser tab and resets on reload.
  const [recentActivity, setRecentActivity] = useState<UsageLogDto[]>([]);

  const recordUsage = useMutation({
    mutationFn: (resourceId: string) => UsageLogsService.recordUsage({ requestBody: resourceId }),
    onSuccess: (dto) => {
      message.success(`Used ${dto.resourceName}`);
      setRecentActivity((prev) => [dto, ...prev]);
    },
    onError: (err) => message.error(getApiErrorMessage(err)),
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
    <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24, alignItems: "start" }}>
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
            const useCount = recentActivity.filter((a) => a.resourceId === resource.id).length;
            const isUsingThis = recordUsage.isPending && recordUsage.variables === resource.id;

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
                    <>
                      <Button
                        type="primary"
                        block
                        icon={<ThunderboltOutlined />}
                        loading={isUsingThis}
                        onClick={() => resource.id && recordUsage.mutate(resource.id)}
                      >
                        Use Now
                      </Button>
                      <div style={{ fontSize: 11, color: "#8c8c8c", marginTop: 8, textAlign: "center" }}>
                        Used {useCount} {useCount === 1 ? "time" : "times"} this session
                      </div>
                    </>
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
                      <LockOutlined style={{ marginRight: 6 }} />
                      Requires {resource.minRequiredLevel}
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

      <Card
        size="small"
        title={
          <>
            <HistoryOutlined style={{ marginRight: 8 }} />
            Recent Activity
          </>
        }
      >
        {recentActivity.length === 0 ? (
          <Text type="secondary">No resources used yet this session.</Text>
        ) : (
          recentActivity.map((entry, i) => (
            <div
              key={entry.id ?? i}
              style={{ padding: "8px 0", borderBottom: "1px solid #f5f5f5" }}
            >
              <div style={{ fontSize: 13 }}>{entry.resourceName}</div>
              <div style={{ fontSize: 11, color: "#8c8c8c" }}>
                {entry.occurredAt ? dayjs(entry.occurredAt).format("MMM D, HH:mm") : ""}
              </div>
            </div>
          ))
        )}
      </Card>
    </div>
  );
};

export default PassengerPortal;
