import { useState } from "react";
import { useSession } from "next-auth/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert, Button, Card, Form, Input, Modal, Popconfirm, message } from "antd";
import { TeamOutlined, UserAddOutlined, UserDeleteOutlined } from "@ant-design/icons";
import { CrewLeadsService, CrewLeadDto } from "open-api";
import { SessionData } from "../../utils/authUtils";
import { getApiErrorMessage } from "../../utils/apiError";

const CrewLeadsPanel = () => {
  const { data } = useSession();
  const session = data as SessionData;
  const queryClient = useQueryClient();

  const {
    data: crewLeads,
    isLoading: crewLeadsLoading,
    isError: crewLeadsError,
  } = useQuery<CrewLeadDto[]>({
    queryKey: ["crewLeads"],
    queryFn: () => CrewLeadsService.listCrewLeads(),
  });

  const [crewLeadModalOpen, setCrewLeadModalOpen] = useState(false);
  const [crewLeadForm] = Form.useForm();
  const [crewLeadError, setCrewLeadError] = useState<string | null>(null);

  const registerCrewLead = useMutation({
    mutationFn: (requestBody: { username: string; name: string }) =>
      CrewLeadsService.registerCrewLead({ requestBody }),
    onSuccess: (dto) => {
      message.success(`Registered ${dto.name} as a crew lead`);
      setCrewLeadModalOpen(false);
      setCrewLeadError(null);
      crewLeadForm.resetFields();
      queryClient.invalidateQueries({ queryKey: ["crewLeads"] });
    },
    onError: (err) => setCrewLeadError(getApiErrorMessage(err)),
  });

  const deleteCrewLead = useMutation({
    mutationFn: (username: string) => CrewLeadsService.deleteCrewLead({ username }),
    onSuccess: () => {
      message.success("Crew lead removed");
      queryClient.invalidateQueries({ queryKey: ["crewLeads"] });
    },
    onError: (err) => message.error(getApiErrorMessage(err)),
  });

  return (
    <Card
      title={
        <>
          <TeamOutlined style={{ marginRight: 8 }} />
          Crew Leads (exactly 3 required)
        </>
      }
      extra={
        <Button
          type="primary"
          icon={<UserAddOutlined />}
          disabled={(crewLeads?.length ?? 0) >= 3}
          onClick={() => setCrewLeadModalOpen(true)}
        >
          Add Crew Lead
        </Button>
      }
      style={{ marginBottom: 20 }}
    >
      {crewLeadsError ? (
        <Alert type="error" showIcon message="Failed to load crew leads" />
      ) : (
        <div style={{ display: "flex", gap: 14 }}>
          {crewLeadsLoading
            ? [1, 2, 3].map((i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    border: "1px solid #f0f0f0",
                    borderRadius: 6,
                    padding: "12px 14px",
                    background: "#fafafa",
                    color: "#bfbfbf",
                  }}
                >
                  Loading…
                </div>
              ))
            : (crewLeads ?? []).map((c) => (
                <div
                  key={c.username}
                  style={{
                    flex: 1,
                    border: "1px solid #f0f0f0",
                    borderRadius: 6,
                    padding: "12px 14px",
                    background: "#fafafa",
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: 8,
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{c.name}</div>
                    <div style={{ fontSize: 12, color: "#8c8c8c", marginTop: 2 }}>
                      {c.username}
                    </div>
                  </div>
                  {c.username !== session?.username && (
                    <Popconfirm
                      title="Remove this crew lead?"
                      onConfirm={() => deleteCrewLead.mutate(c.username)}
                    >
                      <Button
                        danger
                        type="text"
                        size="small"
                        icon={<UserDeleteOutlined />}
                        loading={deleteCrewLead.isPending && deleteCrewLead.variables === c.username}
                      >
                        Remove
                      </Button>
                    </Popconfirm>
                  )}
                </div>
              ))}
        </div>
      )}
      {crewLeadError && (
        <Alert
          type="error"
          showIcon
          message={crewLeadError}
          closable
          onClose={() => setCrewLeadError(null)}
          style={{ marginTop: 16 }}
        />
      )}

      <Modal
        title={
          <>
            <UserAddOutlined style={{ marginRight: 8 }} />
            Add Crew Lead
          </>
        }
        open={crewLeadModalOpen}
        onCancel={() => setCrewLeadModalOpen(false)}
        onOk={() => crewLeadForm.submit()}
        confirmLoading={registerCrewLead.isPending}
      >
        <Form
          form={crewLeadForm}
          layout="vertical"
          onFinish={(values) => registerCrewLead.mutate(values)}
        >
          <Form.Item name="username" label="Username" rules={[{ required: true }]}>
            <Input placeholder="Must match the Keycloak username" />
          </Form.Item>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default CrewLeadsPanel;
