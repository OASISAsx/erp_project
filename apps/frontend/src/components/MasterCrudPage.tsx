"use client";

import "@ant-design/v5-patch-for-react-19";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import {
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Space,
  Switch,
  Table,
  Typography,
  message
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useSession } from "next-auth/react";
import { apiClient, getAuthHeaders } from "@/lib/api";
import styles from "@/app/master/master.module.scss";
import { MasterSectionShell } from "./MasterSectionShell";

export type MasterField = {
  name: string;
  label: string;
  required?: boolean;
  type?: "text" | "textarea" | "number" | "switch";
  width?: number;
  render?: (value: unknown, record: MasterRecord) => ReactNode;
};

export type MasterRecord = {
  id: string;
  [key: string]: unknown;
};

type MasterCrudPageProps = {
  title: string;
  description: string;
  endpoint: string;
  createLabel: string;
  fields: MasterField[];
  initialValues: Record<string, unknown>;
};

export function MasterCrudPage({
  title,
  description,
  endpoint,
  createLabel,
  fields,
  initialValues
}: MasterCrudPageProps) {
  const { data: session, status } = useSession();
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();
  const [records, setRecords] = useState<MasterRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MasterRecord | null>(null);

  const authHeaders = useMemo(() => getAuthHeaders(session?.accessToken), [session?.accessToken]);

  const loadRecords = async () => {
    if (status !== "authenticated" || !authHeaders) {
      setRecords([]);
      return;
    }

    setLoading(true);

    try {
      const response = await apiClient.get<MasterRecord[]>(endpoint, { headers: authHeaders });
      setRecords(response.data);
    } catch {
      messageApi.error("โหลดข้อมูลไม่สำเร็จ");
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authHeaders, endpoint, status]);

  const openCreate = () => {
    setEditingRecord(null);
    form.setFieldsValue(initialValues);
    setModalOpen(true);
  };

  const openEdit = (record: MasterRecord) => {
    setEditingRecord(record);
    form.setFieldsValue(record);
    setModalOpen(true);
  };

  const submit = async () => {
    if (!authHeaders) {
      return;
    }

    const values = await form.validateFields();
    setSaving(true);

    try {
      if (editingRecord) {
        await apiClient.patch(`${endpoint}/${editingRecord.id}`, values, { headers: authHeaders });
        messageApi.success("แก้ไขข้อมูลแล้ว");
      } else {
        await apiClient.post(endpoint, values, { headers: authHeaders });
        messageApi.success("สร้างข้อมูลแล้ว");
      }

      setModalOpen(false);
      await loadRecords();
    } catch {
      messageApi.error("บันทึกข้อมูลไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (record: MasterRecord) => {
    if (!authHeaders) {
      return;
    }

    try {
      await apiClient.delete(`${endpoint}/${record.id}`, { headers: authHeaders });
      messageApi.success("ลบข้อมูลแล้ว");
      await loadRecords();
    } catch {
      messageApi.error("ลบข้อมูลไม่สำเร็จ");
    }
  };

  const columns: ColumnsType<MasterRecord> = [
    ...fields.map((field) => ({
      title: field.label,
      dataIndex: field.name,
      width: field.width,
      render: (value: unknown, record: MasterRecord) =>
        field.render ? field.render(value, record) : value ? String(value) : "-"
    })),
    {
      title: "",
      key: "actions",
      width: 126,
      align: "right" as const,
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => openEdit(record)} />
          <Popconfirm title="ลบข้อมูลนี้?" okText="ลบ" cancelText="ยกเลิก" onConfirm={() => remove(record)}>
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <MasterSectionShell>
      {contextHolder}
      <section className={styles.panel}>
        <div className={styles.crudHeader}>
          <div>
            <Typography.Title level={3}>{title}</Typography.Title>
            <Typography.Text type="secondary">{description}</Typography.Text>
          </div>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            {createLabel}
          </Button>
        </div>

        <Table
          rowKey="id"
          columns={columns}
          dataSource={records}
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 820 }}
        />
      </section>

      <Modal
        title={editingRecord ? `แก้ไข${title}` : createLabel}
        open={modalOpen}
        okText="บันทึก"
        cancelText="ยกเลิก"
        confirmLoading={saving}
        onCancel={() => setModalOpen(false)}
        onOk={submit}
      >
        <Form form={form} layout="vertical" initialValues={initialValues}>
          {fields.map((field) => (
            <Form.Item
              key={field.name}
              name={field.name}
              label={field.label}
              valuePropName={field.type === "switch" ? "checked" : "value"}
              rules={field.required ? [{ required: true, message: `กรุณากรอก${field.label}` }] : undefined}
            >
              {field.type === "textarea" ? (
                <Input.TextArea rows={3} />
              ) : field.type === "number" ? (
                <InputNumber min={0} style={{ width: "100%" }} />
              ) : field.type === "switch" ? (
                <Switch checkedChildren="ใช้งาน" unCheckedChildren="ปิด" />
              ) : (
                <Input />
              )}
            </Form.Item>
          ))}
        </Form>
      </Modal>
    </MasterSectionShell>
  );
}
