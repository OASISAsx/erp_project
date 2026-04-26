"use client";

import "@ant-design/v5-patch-for-react-19";
import { useEffect, useMemo, useState } from "react";
import {
  AppstoreOutlined,
  LogoutOutlined,
  SafetyCertificateOutlined,
  UserOutlined
} from "@ant-design/icons";
import {
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
import styles from "./page.module.scss";

type Department = {
  id: string;
  code: string;
  name: string;
  description?: string | null;
};

type UserRow = {
  id: string;
  email: string;
  name: string;
  role: string;
  departmentId?: string | null;
  departmentName?: string | null;
  isActive: boolean;
};

type MenuPermission = {
  key: string;
  label: string;
  description: string;
  canView: boolean;
};

type DepartmentForm = {
  code: string;
  name: string;
};

export default function UserMenuPermissionsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm<DepartmentForm>();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [menuPermissions, setMenuPermissions] = useState<MenuPermission[]>([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>();
  const [saving, setSaving] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
  const authHeaders = useMemo(
    () => ({
      "Content-Type": "application/json",
      ...(session?.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {})
    }),
    [session?.accessToken]
  );

  const loadData = async () => {
    if (!session?.accessToken) {
      return;
    }

    const [departmentResponse, userResponse] = await Promise.all([
      fetch(`${apiUrl}/admin/departments`, { headers: authHeaders }),
      fetch(`${apiUrl}/admin/users`, { headers: authHeaders })
    ]);

    if (!departmentResponse.ok || !userResponse.ok) {
      messageApi.error("โหลดข้อมูลสิทธิ์ไม่สำเร็จ");
      return;
    }

    const nextDepartments = (await departmentResponse.json()) as Department[];
    setDepartments(nextDepartments);
    setUsers((await userResponse.json()) as UserRow[]);
    setSelectedDepartmentId((current) => current ?? nextDepartments[0]?.id);
  };

  const loadPermissions = async (departmentId: string) => {
    const response = await fetch(`${apiUrl}/admin/menu-permissions?departmentId=${departmentId}`, {
      headers: authHeaders
    });

    if (!response.ok) {
      messageApi.error("โหลดสิทธิ์เมนูไม่สำเร็จ");
      return;
    }

    setMenuPermissions((await response.json()) as MenuPermission[]);
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.accessToken]);

  useEffect(() => {
    if (selectedDepartmentId && session?.accessToken) {
      loadPermissions(selectedDepartmentId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDepartmentId, session?.accessToken]);

  const createDepartment = async (values: DepartmentForm) => {
    const response = await fetch(`${apiUrl}/admin/departments`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify(values)
    });

    if (!response.ok) {
      messageApi.error("สร้างแผนกไม่สำเร็จ");
      return;
    }

    form.resetFields();
    messageApi.success("สร้างแผนกสำเร็จ");
    await loadData();
  };

  const assignDepartment = async (userId: string, departmentId?: string) => {
    const response = await fetch(`${apiUrl}/admin/users/${userId}/department`, {
      method: "PATCH",
      headers: authHeaders,
      body: JSON.stringify({ departmentId: departmentId ?? null })
    });

    if (!response.ok) {
      messageApi.error("อัปเดตแผนกผู้ใช้ไม่สำเร็จ");
      return;
    }

    messageApi.success("อัปเดตแผนกผู้ใช้แล้ว");
    await loadData();
  };

  const saveMenuPermissions = async () => {
    if (!selectedDepartmentId) {
      messageApi.warning("กรุณาเลือกแผนก");
      return;
    }

    setSaving(true);
    const menuKeys = menuPermissions.filter((item) => item.canView).map((item) => item.key);
    const response = await fetch(`${apiUrl}/admin/menu-permissions/${selectedDepartmentId}`, {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify({ menuKeys })
    });
    setSaving(false);

    if (!response.ok) {
      messageApi.error("บันทึกสิทธิ์เมนูไม่สำเร็จ");
      return;
    }

    messageApi.success("บันทึกสิทธิ์เมนูแล้ว");
    setMenuPermissions((await response.json()) as MenuPermission[]);
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
          onChange={(value) => assignDepartment(row.id, value)}
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
          <div className={styles.toolbar}>
            <Form form={form} layout="vertical" onFinish={createDepartment}>
              <Space.Compact style={{ width: "100%" }}>
                <Form.Item name="code" rules={[{ required: true, message: "กรอกรหัสแผนก" }]} style={{ width: 110 }}>
                  <Input placeholder="CODE" />
                </Form.Item>
                <Form.Item name="name" rules={[{ required: true, message: "กรอกชื่อแผนก" }]} style={{ flex: 1 }}>
                  <Input placeholder="ชื่อแผนก" />
                </Form.Item>
                <Button type="primary" htmlType="submit">
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
              <Table rowKey="id" columns={userColumns} dataSource={users} pagination={{ pageSize: 8 }} />
            </section>

            <section className={styles.panel}>
              <div className={styles.panelTitle}>
                <Typography.Title level={4}>เมนูที่แผนกมองเห็น</Typography.Title>
                <Typography.Text type="secondary">ติ๊กเมนูหลักที่ต้องการให้แผนกนี้เห็น</Typography.Text>
              </div>
              <div className={styles.menuPermissionList}>
                {menuPermissions.map((item) => (
                  <label className={styles.menuPermissionItem} key={item.key}>
                    <Checkbox
                      checked={item.canView}
                      onChange={(event) =>
                        setMenuPermissions((current) =>
                          current.map((menu) =>
                            menu.key === item.key ? { ...menu, canView: event.target.checked } : menu
                          )
                        )
                      }
                    >
                      <strong>{item.label}</strong>
                      <Typography.Text className={styles.menuDescription}>{item.description}</Typography.Text>
                    </Checkbox>
                  </label>
                ))}
              </div>
              <Button type="primary" block loading={saving} onClick={saveMenuPermissions} style={{ marginTop: 18 }}>
                บันทึกสิทธิ์เมนู
              </Button>
            </section>
          </div>
        </Layout.Content>
      </Layout>
    </Layout>
  );
}
