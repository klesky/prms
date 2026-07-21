import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert, Button, Card, Form, Input, Modal, Popconfirm, Select, Table, Tag, message } from "antd";
import { DatabaseOutlined, PlusOutlined, StopOutlined } from "@ant-design/icons";
import { ResourcesService, ResourceDto } from "open-api";
import type { MembershipLevel } from "../../utils/authUtils";
import { MEMBERSHIP_LEVELS, membershipTagColor } from "../../utils/membership";
import { getApiErrorMessage } from "../../utils/apiError";

const ShipResourcesPanel = () => {
  const queryClient = useQueryClient();

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
            pageSizeOptions: ["10", "20", "50"],
            position: ["bottomRight"],
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
    </Card>
  );
};

export default ShipResourcesPanel;
