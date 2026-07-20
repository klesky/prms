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

const { Title, Paragraph } = Typography;

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

  // --- Passengers: list, register, change membership level ---
  const {
    data: passengers,
    isLoading: passengersLoading,
    isError: passengersError,
  } = useQuery<PassengerDto[]>({
    queryKey: ["passengers"],
    queryFn: () => PassengersService.listPassengers(),
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

  const changeMembershipLevel = useMutation({
    mutationFn: ({ username, level }: { username: string; level: MembershipLevel }) =>
      PassengersService.changeMembershipLevel({ username, requestBody: level }),
    onSuccess: (dto) => {
      message.success(`${dto.name} is now ${dto.membershipLevel}`);
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

      <Card
        title="Passengers"
        extra={
          <Button type="primary" onClick={() => setPassengerModalOpen(true)}>
            + Add Passenger
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
            pagination={false}
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
                  <Select<MembershipLevel>
                    value={record.membershipLevel}
                    style={{ width: 140 }}
                    disabled={
                      changeMembershipLevel.isPending &&
                      changeMembershipLevel.variables?.username === record.username
                    }
                    onChange={(level) => changeMembershipLevel.mutate({ username: record.username, level })}
                  >
                    {MEMBERSHIP_LEVELS.map((level) => (
                      <Select.Option key={level} value={level}>
                        {level}
                      </Select.Option>
                    ))}
                  </Select>
                ),
              },
            ]}
          />
        )}
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
