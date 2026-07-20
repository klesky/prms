import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  Button,
  Card,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import {
  CrewLeadsService,
  PassengersService,
  PassengerDto,
  ResourcesService,
  ResourceDto,
} from "open-api";
import type { MembershipLevel } from "../../utils/authUtils";
import { MEMBERSHIP_LEVELS, membershipTagColor } from "../../utils/membership";
import { getApiErrorMessage } from "../../utils/apiError";

const { Title, Paragraph, Text } = Typography;

const CrewLeadDashboard = () => {
  const queryClient = useQueryClient();

  // --- Crew Leads: enforce-exactly-3 registration ---
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
    },
    onError: (err) => setCrewLeadError(getApiErrorMessage(err)),
  });

  // --- Passengers: register + change membership level (no list endpoint yet) ---
  const [passengerModalOpen, setPassengerModalOpen] = useState(false);
  const [passengerForm] = Form.useForm();
  const [lastRegisteredPassenger, setLastRegisteredPassenger] = useState<PassengerDto | null>(null);

  const registerPassenger = useMutation({
    mutationFn: (requestBody: { username: string; name: string; membershipLevel: MembershipLevel }) =>
      PassengersService.registerPassenger({ requestBody }),
    onSuccess: (dto) => {
      message.success(`Registered ${dto.name} as a passenger`);
      setLastRegisteredPassenger(dto);
      setPassengerModalOpen(false);
      passengerForm.resetFields();
    },
    onError: (err) => message.error(getApiErrorMessage(err)),
  });

  const [levelForm] = Form.useForm();
  const [lastLevelChange, setLastLevelChange] = useState<PassengerDto | null>(null);

  const changeMembershipLevel = useMutation({
    mutationFn: ({ username, level }: { username: string; level: MembershipLevel }) =>
      PassengersService.changeMembershipLevel({ username, requestBody: level }),
    onSuccess: (dto) => {
      message.success(`${dto.username} is now ${dto.membershipLevel}`);
      setLastLevelChange(dto);
      levelForm.resetFields(["username"]);
    },
    onError: (err) => message.error(getApiErrorMessage(err)),
  });

  // --- Ship Resources: list, add, decommission ---
  const {
    data: resources,
    isLoading: resourcesLoading,
    isError: resourcesError,
  } = useQuery<ResourceDto[]>({
    queryKey: ["resources"],
    queryFn: () => ResourcesService.listResources(),
  });

  const [resourceModalOpen, setResourceModalOpen] = useState(false);
  const [resourceForm] = Form.useForm();

  const provisionResource = useMutation({
    mutationFn: (requestBody: { name: string; minRequiredLevel: MembershipLevel }) =>
      ResourcesService.provisionResource({ requestBody }),
    onSuccess: (dto) => {
      message.success(`Provisioned "${dto.name}"`);
      setResourceModalOpen(false);
      resourceForm.resetFields();
      queryClient.invalidateQueries({ queryKey: ["resources"] });
    },
    onError: (err) => message.error(getApiErrorMessage(err)),
  });

  const decommissionResource = useMutation({
    mutationFn: (resourceId: string) => ResourcesService.decommissionResource({ resourceId }),
    onSuccess: () => {
      message.success("Resource decommissioned");
      queryClient.invalidateQueries({ queryKey: ["resources"] });
    },
    onError: (err) => message.error(getApiErrorMessage(err)),
  });

  return (
    <Typography>
      <Title level={3}>Crew Lead Dashboard</Title>

      <Card
        title="Crew Leads"
        extra={
          <Button type="primary" onClick={() => setCrewLeadModalOpen(true)}>
            + Add Crew Lead
          </Button>
        }
        style={{ marginBottom: 20 }}
      >
        <Paragraph type="secondary">
          The ship allows exactly 3 crew leads; the backend rejects a 4th registration.
          There's no directory endpoint yet, so the current roster isn't listed here.
        </Paragraph>
        {crewLeadError && (
          <Alert
            type="error"
            showIcon
            message={crewLeadError}
            closable
            onClose={() => setCrewLeadError(null)}
          />
        )}
      </Card>

      <Card title="Passengers" style={{ marginBottom: 20 }}>
        <Space direction="vertical" style={{ width: "100%" }} size={20}>
          <div>
            <Space align="center" style={{ marginBottom: 8 }}>
              <Text strong>Register a passenger</Text>
              <Button size="small" type="primary" onClick={() => setPassengerModalOpen(true)}>
                + Add Passenger
              </Button>
            </Space>
            {lastRegisteredPassenger && (
              <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                Last registered: <Text code>{lastRegisteredPassenger.username}</Text>{" "}
                ({lastRegisteredPassenger.name}) —{" "}
                <Tag color={membershipTagColor[lastRegisteredPassenger.membershipLevel]}>
                  {lastRegisteredPassenger.membershipLevel}
                </Tag>
              </Paragraph>
            )}
          </div>

          <div>
            <Text strong>Change membership level</Text>
            <Form
              form={levelForm}
              layout="inline"
              style={{ marginTop: 8 }}
              onFinish={(values) =>
                changeMembershipLevel.mutate({ username: values.username, level: values.level })
              }
            >
              <Form.Item name="username" rules={[{ required: true, message: "Username required" }]}>
                <Input placeholder="Passenger username" />
              </Form.Item>
              <Form.Item name="level" rules={[{ required: true, message: "Level required" }]}>
                <Select placeholder="New level" style={{ width: 140 }}>
                  {MEMBERSHIP_LEVELS.map((level) => (
                    <Select.Option key={level} value={level}>
                      {level}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item>
                <Button htmlType="submit" loading={changeMembershipLevel.isPending}>
                  Update
                </Button>
              </Form.Item>
            </Form>
            {lastLevelChange && (
              <Paragraph type="secondary" style={{ marginTop: 8, marginBottom: 0 }}>
                <Text code>{lastLevelChange.username}</Text> ({lastLevelChange.name}) is now{" "}
                <Tag color={membershipTagColor[lastLevelChange.membershipLevel]}>
                  {lastLevelChange.membershipLevel}
                </Tag>
              </Paragraph>
            )}
          </div>
        </Space>
      </Card>

      <Card
        title="Ship Resources"
        extra={
          <Button type="primary" onClick={() => setResourceModalOpen(true)}>
            + Add Resource
          </Button>
        }
      >
        {resourcesError ? (
          <Alert type="error" showIcon message="Failed to load resources" />
        ) : (
          <Table<ResourceDto>
            rowKey="id"
            loading={resourcesLoading}
            dataSource={resources ?? []}
            pagination={false}
            columns={[
              { title: "Resource", dataIndex: "name", key: "name" },
              {
                title: "Min. Level",
                dataIndex: "minRequiredLevel",
                key: "minRequiredLevel",
                render: (level: MembershipLevel) => (
                  <Tag color={membershipTagColor[level]}>{level}</Tag>
                ),
              },
              {
                title: "Actions",
                key: "actions",
                align: "right",
                render: (_, record) => (
                  <Popconfirm
                    title="Decommission this resource?"
                    onConfirm={() => record.id && decommissionResource.mutate(record.id)}
                  >
                    <Button danger size="small">
                      Decommission
                    </Button>
                  </Popconfirm>
                ),
              },
            ]}
          />
        )}
      </Card>

      <Modal
        title="Add Crew Lead"
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

      <Modal
        title="Add Passenger"
        open={passengerModalOpen}
        onCancel={() => setPassengerModalOpen(false)}
        onOk={() => passengerForm.submit()}
        confirmLoading={registerPassenger.isPending}
      >
        <Form
          form={passengerForm}
          layout="vertical"
          initialValues={{ membershipLevel: "SILVER" }}
          onFinish={(values) => registerPassenger.mutate(values)}
        >
          <Form.Item name="username" label="Username" rules={[{ required: true }]}>
            <Input placeholder="Must match the Keycloak username" />
          </Form.Item>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="membershipLevel" label="Membership Level" rules={[{ required: true }]}>
            <Select>
              {MEMBERSHIP_LEVELS.map((level) => (
                <Select.Option key={level} value={level}>
                  {level}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Add Resource"
        open={resourceModalOpen}
        onCancel={() => setResourceModalOpen(false)}
        onOk={() => resourceForm.submit()}
        confirmLoading={provisionResource.isPending}
      >
        <Form
          form={resourceForm}
          layout="vertical"
          initialValues={{ minRequiredLevel: "SILVER" }}
          onFinish={(values) => provisionResource.mutate(values)}
        >
          <Form.Item name="name" label="Resource name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="minRequiredLevel" label="Minimum level" rules={[{ required: true }]}>
            <Select>
              {MEMBERSHIP_LEVELS.map((level) => (
                <Select.Option key={level} value={level}>
                  {level}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </Typography>
  );
};

export default CrewLeadDashboard;
