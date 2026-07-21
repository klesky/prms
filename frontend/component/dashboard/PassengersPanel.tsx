import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert, Button, Card, Form, Input, Modal, Select, Table, Tag, Tooltip, message } from "antd";
import { EditOutlined, UserAddOutlined, UserOutlined } from "@ant-design/icons";
import { PassengersService, PassengerDto } from "open-api";
import type { MembershipLevel } from "../../utils/authUtils";
import { MEMBERSHIP_LEVELS, membershipTagColor } from "../../utils/membership";
import { getApiErrorMessage } from "../../utils/apiError";

const PassengersPanel = () => {
  const queryClient = useQueryClient();

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

  return (
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
            pageSizeOptions: ["10", "20", "50"],
            position: ["bottomRight"],
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
    </Card>
  );
};

export default PassengersPanel;
