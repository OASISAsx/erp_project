"use client";

import "@ant-design/v5-patch-for-react-19";
import { useEffect, useState } from "react";
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
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useSession } from "next-auth/react";
import { useMasterDataStore } from "@/stores/masterDataStore";
import type { MasterField, MasterRecord } from "@/types/master.type";
import styles from "@/app/master/master.module.scss";
import { MasterSectionShell } from "./MasterSectionShell";

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
  initialValues,
}: MasterCrudPageProps) {
  const { data: session, status } = useSession();
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MasterRecord | null>(null);
  const {
    records,
    loading,
    saving,
    loadRecords: loadStoreRecords,
    createRecord,
    updateRecord,
    deleteRecord,
    clearRecords,
  } = useMasterDataStore();

  const loadRecords = async () => {
    if (status !== "authenticated" || !session?.accessToken) {
      clearRecords();
      return;
    }

    try {
      await loadStoreRecords(endpoint, session.accessToken);
    } catch {
      messageApi.error("Load failed");
    }
  };

  useEffect(() => {
    loadRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint, session?.accessToken, status]);

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
    if (!session?.accessToken) {
      return;
    }

    const values = await form.validateFields();

    try {
      if (editingRecord) {
        await updateRecord(
          endpoint,
          editingRecord.id,
          values,
          session.accessToken,
        );
        messageApi.success("แก้ไขข้อมูลแล้ว");
      } else {
        await createRecord(endpoint, values, session.accessToken);
        messageApi.success("สร้างข้อมูลแล้ว");
      }

      setModalOpen(false);
      await loadRecords();
    } catch {
      messageApi.error("Save failed");
    }
  };

  const remove = async (record: MasterRecord) => {
    if (!session?.accessToken) {
      return;
    }

    try {
      await deleteRecord(endpoint, record.id, session.accessToken);
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
        field.render
          ? field.render(value, record)
          : value
            ? String(value)
            : "-",
    })),
    {
      title: "",
      key: "actions",
      width: 126,
      align: "right" as const,
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => openEdit(record)} />
          <Popconfirm
            title="ลบข้อมูลนี้?"
            okText="ลบ"
            cancelText="ยกเลิก"
            onConfirm={() => remove(record)}
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
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
              rules={
                field.required
                  ? [{ required: true, message: `กรุณากรอก${field.label}` }]
                  : undefined
              }
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
