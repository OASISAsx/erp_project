"use client";

import "@ant-design/v5-patch-for-react-19";
import { useEffect } from "react";
import {
  AppstoreOutlined,
  LogoutOutlined,
  SafetyCertificateOutlined,
  UserOutlined
} from "@ant-design/icons";
import {
  Alert,
  Avatar,
  Button,
  Checkbox,
  Form,
  Input,
  Layout,
  Menu,
  Select,
  Space,
  Table,
  Typography,
  message
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useUserMenuPermissionStore } from "@/stores/userMenuPermissionStore";
import type { DepartmentForm, UserRow } from "@/types/admin";
import styles from "./page.module.scss";

export default function UserMenuPermissionsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm<DepartmentForm>();
  const {
    departments,
    users,
    menuPermissions,
    selectedDepartmentId,
    loading,
    saving,
    error,
    setSelectedDepartmentId,
    setMenuPermission,
    loadData,
    loadPermissions,
    createDepartment,
    assignDepartment,
    saveMenuPermissions,
    clearError
  } = useUserMenuPermissionStore();

  const accessToken = session?.accessToken;

  useEffect(() => {
    loadData(accessToken);
  }, [accessToken, loadData]);

  useEffect(() => {
    if (selectedDepartmentId) {
      loadPermissions(selectedDepartmentId, accessToken);
    }
  }, [accessToken, loadPermissions, selectedDepartmentId]);

  useEffect(() => {
    if (error) {
      messageApi.error(error);
    }
  }, [error, messageApi]);

  const submitDepartment = async (values: DepartmentForm) => {
    try {
      await createDepartment(values, accessToken);
      form.resetFields();
      messageApi.success("สร้างแผนกสำเร็จ");
    } catch {
      // Zustand already stores the error for the alert and toast.
    }
  };

  const updateUserDepartment = async (userId: string, departmentId?: string) => {
    try {
      await assignDepartment(userId, departmentId, accessToken);
      messageApi.success("อัปเดตแผนกผู้ใช้แล้ว");
    } catch {
      // Zustand already stores the error for the alert and toast.
    }
  };

  const submitMenuPermissions = async () => {
    if (!selectedDepartmentId) {
      messageApi.warning("กรุณาเลือกแผนก");
      return;
    }

    try {
      await saveMenuPermissions(accessToken);
      messageApi.success("บันทึกสิทธิ์เมนูแล้ว");
    } catch {
      // Zustand already stores the error for the alert and toast.
    }
  };

  const userColumns: ColumnsType<UserRow> = [
    {
      title: "ผู้ใช้",
      dataIndex: "name",
      render: (_, row) => (
        <div>
          <strong>{row.name}</strong>
          <Typography.Text type="secondary" style={{ display: "block" }}>
            {row.email}
          </Typography.Text>
        </div>
      )
    },
    { title: "สิทธิ์", dataIndex: "role", width: 130 },
    {
      title: "แผนก",
      dataIndex: "departmentId",
      width: 260,
      render: (_, row) => (
        <Select
          allowClear
          placeholder="เลือกแผนก"
          value={row.departmentId ?? undefined}
          style={{ width: "100%" }}
          options={departments.map((department) => ({
            value: department.id,
            label: department.name
          }))}
          onChange={(value) => updateUserDepartment(row.id, value)}
        />
      )
    }
  ];

  return (
    <Layout className={styles.shell}>
      {contextHolder}
      <Layout.Sider breakpoint="lg" collapsedWidth="0" className={styles.sider}>
        <div className={styles.logo}>ERP</div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={["permissions"]}
          onClick={({ key }) => {
            if (key === "dashboard") {
              router.push("/main-menu");
            }
          }}
          items={[
            { key: "dashboard", icon: <AppstoreOutlined />, label: "เมนูหลัก" },
            { key: "permissions", icon: <SafetyCertificateOutlined />, label: "สิทธิ์เมนู" }
          ]}
        />
      </Layout.Sider>

      <Layout>
        <Layout.Header className={styles.header}>
          <div>
            <Typography.Title level={3}>ตั้งค่าสิทธิ์เมนูผู้ใช้</Typography.Title>
            <Typography.Text type="secondary">กำหนดแผนกของผู้ใช้ และเลือกเมนูหลักที่แต่ละแผนกมองเห็น</Typography.Text>
          </div>
          <div className={styles.profile}>
            <Avatar icon={<UserOutlined />} />
            <span>{session?.user?.name ?? "Admin"}</span>
            <Button icon={<LogoutOutlined />} onClick={() => signOut({ callbackUrl: "/login" })}>
              ออกจากระบบ
            </Button>
          </div>
        </Layout.Header>

        <Layout.Content className={styles.content}>
          {error ? (
            <Alert
              closable
              showIcon
              type="error"
              message="เชื่อมต่อ backend ไม่สำเร็จ"
              description={error}
              onClose={clearError}
              style={{ marginBottom: 20 }}
            />
          ) : null}

          <div className={styles.toolbar}>
            <Form form={form} layout="vertical" onFinish={submitDepartment}>
              <Space.Compact style={{ width: "100%" }}>
                <Form.Item name="code" rules={[{ required: true, message: "กรอกรหัสแผนก" }]} style={{ width: 110 }}>
                  <Input placeholder="CODE" />
                </Form.Item>
                <Form.Item name="name" rules={[{ required: true, message: "กรอกชื่อแผนก" }]} style={{ flex: 1 }}>
                  <Input placeholder="ชื่อแผนก" />
                </Form.Item>
                <Button type="primary" htmlType="submit" loading={saving}>
                  เพิ่มแผนก
                </Button>
              </Space.Compact>
            </Form>

            <Select
              placeholder="เลือกแผนกเพื่อตั้งสิทธิ์เมนู"
              value={selectedDepartmentId}
              options={departments.map((department) => ({
                value: department.id,
                label: `${department.name} (${department.code})`
              }))}
              onChange={setSelectedDepartmentId}
            />
          </div>

          <div className={styles.panelGrid}>
            <section className={styles.panel}>
              <div className={styles.panelTitle}>
                <Typography.Title level={4}>ผู้ใช้และแผนก</Typography.Title>
                <Typography.Text type="secondary">เลือกแผนกให้ user เพื่อรับสิทธิ์เมนูตามแผนกนั้น</Typography.Text>
              </div>
              <Table
                rowKey="id"
                columns={userColumns}
                dataSource={users}
                loading={loading}
                pagination={{ pageSize: 8 }}
              />
            </section>

            <section className={styles.panel}>
              <div className={styles.panelTitle}>
                <Typography.Title level={4}>เมนูที่แผนกมองเห็น</Typography.Title>
                <Typography.Text type="secondary">ติ๊กเมนูหลักที่ต้องการให้แผนกนี้เห็น</Typography.Text>
              </div>
              <div className={styles.menuPermissionList}>
                {menuPermissions.map((item) => (
                  <label className={styles.menuPermissionItem} key={item.key}>
                    <Checkbox checked={item.canView} onChange={(event) => setMenuPermission(item.key, event.target.checked)}>
                      <strong>{item.label}</strong>
                      <Typography.Text className={styles.menuDescription}>{item.description}</Typography.Text>
                    </Checkbox>
                  </label>
                ))}
              </div>
              <Button type="primary" block loading={saving} onClick={submitMenuPermissions} style={{ marginTop: 18 }}>
                บันทึกสิทธิ์เมนู
              </Button>
            </section>
          </div>
        </Layout.Content>
      </Layout>
    </Layout>
  );
}
