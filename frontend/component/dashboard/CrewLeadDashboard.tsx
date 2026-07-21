import { useState } from "react";
import { useSession } from "next-auth/react";
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
  Table,
  Tag,
  Tooltip,
  Typography,
  message,
} from "antd";
import {
  DatabaseOutlined,
  EditOutlined,
  PlusOutlined,
  RocketOutlined,
  StopOutlined,
  TeamOutlined,
  UserAddOutlined,
  UserDeleteOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  CrewLeadsService,
  CrewLeadDto,
  PassengersService,
  PassengerDto,
  ResourcesService,
  ResourceDto,
} from "open-api";
import type { MembershipLevel } from "../../utils/authUtils";
import { SessionData } from "../../utils/authUtils";
import { MEMBERSHIP_LEVELS, membershipTagColor } from "../../utils/membership";
import MembershipLevelReport from "./MembershipLevelReport";
import ResourceUsageReport from "./ResourceUsageReport";
import { getApiErrorMessage } from "../../utils/apiError";

const { Title } = Typography;

const CrewLeadDashboard = () => {
  const { data } = useSession();
  const session = data as SessionData;
  const queryClient = useQueryClient();

  // --- Crew Leads: list + enforce-exactly-3 registration ---
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

  // --- Passengers: list, register, change membership level ---
  const {
    data: passengers,
    isLoading: passengersLoading,
    isError: passengersError,
  } = useQuery<PassengerDto[]>({
    queryKey: ["passengers"],
    queryFn: () => PassengersService.listPassengers(),
    select: (data) => [...data].sort((a, b) => a.username.localeCompare(b.username)),
  });

  const [passengerModalOpen, setPassengerModalOpen] = useState(false);
  const [passengerForm] = Form.useForm();

  const registerPassenger = useMutation({
    mutationFn: (requestBody: { username: string; name: string; membershipLevel: MembershipLevel }) =>
      PassengersService.registerPassenger({ requestBody }),
    onSuccess: (dto) => {
      message.success(`Registered ${dto.name} as a passenger`);
      setPassengerModalOpen(false);
      passengerForm.resetFields();
      queryClient.invalidateQueries({ queryKey: ["passengers"] });
    },
    onError: (err) => message.error(getApiErrorMessage(err)),
  });

  const [editingPassenger, setEditingPassenger] = useState<PassengerDto | null>(null);
  const [membershipForm] = Form.useForm();

  const changeMembershipLevel = useMutation({
    mutationFn: ({ username, level }: { username: string; level: MembershipLevel }) =>
      PassengersService.changeMembershipLevel({ username, requestBody: level }),
    onSuccess: (dto) => {
      message.success(`${dto.name} is now ${dto.membershipLevel}`);
      setEditingPassenger(null);
      queryClient.invalidateQueries({ queryKey: ["passengers"] });
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
      <Title level={3}>
        <RocketOutlined style={{ marginRight: 10 }} />
        Crew Lead Dashboard
      </Title>

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
      </Card>

      <Card
        title={
          <>
            <UserOutlined style={{ marginRight: 8 }} />
            Passengers
          </>
        }
        extra={
          <Button type="primary" icon={<UserAddOutlined />} onClick={() => setPassengerModalOpen(true)}>
            Add Passenger
          </Button>
        }
        style={{ marginBottom: 20 }}
      >
        {passengersError ? (
          <Alert type="error" showIcon message="Failed to load passengers" />
        ) : (
          <Table<PassengerDto>
            rowKey="username"
            loading={passengersLoading}
            dataSource={passengers ?? []}
            pagination={{
                defaultPageSize: 10,
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '50'],
                position: ['bottomRight']
            }}
            columns={[
              { title: "Username", dataIndex: "username", key: "username" },
              { title: "Name", dataIndex: "name", key: "name" },
              {
                title: "Membership",
                dataIndex: "membershipLevel",
                key: "membershipLevel",
                render: (level: MembershipLevel) => (
                  <Tag color={membershipTagColor[level]}>{level}</Tag>
                ),
              },
              {
                title: "Actions",
                key: "actions",
                align: "right",
                render: (_, record) => (
                  <Tooltip title="Change membership level">
                    <Button
                      shape="circle"
                      icon={<EditOutlined />}
                      onClick={() => {
                        setEditingPassenger(record);
                        membershipForm.setFieldsValue({ membershipLevel: record.membershipLevel });
                      }}
                    />
                  </Tooltip>
                ),
              },
            ]}
          />
        )}
      </Card>

      <Card
        title={
          <>
            <DatabaseOutlined style={{ marginRight: 8 }} />
            Ship Resources
          </>
        }
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setResourceModalOpen(true)}>
            Add Resource
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
            pagination={{
                defaultPageSize: 10,
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '50'],
                position: ['bottomRight']
            }}
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
                    title="Decommission this resource? This will also delete the Usage Log history of the Resource."
                    onConfirm={() => record.id && decommissionResource.mutate(record.id)}
                  >
                    <Button danger size="small" icon={<StopOutlined />}>
                      Decommission
                    </Button>
                  </Popconfirm>
                ),
              },
            ]}
          />
        )}
      </Card>

      <MembershipLevelReport />
      <ResourceUsageReport />

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

      <Modal
        title={
          <>
            <UserAddOutlined style={{ marginRight: 8 }} />
            Add Passenger
          </>
        }
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
        title={
          <>
            <PlusOutlined style={{ marginRight: 8 }} />
            Add Resource
          </>
        }
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

      <Modal
        title={
          <>
            <EditOutlined style={{ marginRight: 8 }} />
            Change Membership Level
            {editingPassenger ? ` — ${editingPassenger.name}` : ""}
          </>
        }
        open={!!editingPassenger}
        onCancel={() => setEditingPassenger(null)}
        onOk={() => membershipForm.submit()}
        confirmLoading={changeMembershipLevel.isPending}
      >
        <Form
          form={membershipForm}
          layout="vertical"
          onFinish={(values) =>
            editingPassenger &&
            changeMembershipLevel.mutate({
              username: editingPassenger.username,
              level: values.membershipLevel,
            })
          }
        >
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
    </Typography>
  );
};

export default CrewLeadDashboard;
