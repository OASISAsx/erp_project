"use client";

import "@ant-design/v5-patch-for-react-19";
import { useEffect, useState } from "react";
import {
  AppstoreOutlined,
  AuditOutlined,
  BankOutlined,
  BarChartOutlined,
  LogoutOutlined,
  SafetyCertificateOutlined,
  ShoppingCartOutlined,
  TeamOutlined,
  UserOutlined
} from "@ant-design/icons";
import { Avatar, Button, Layout, Menu, Typography } from "antd";
import type { MenuProps } from "antd";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import styles from "./page.module.scss";

type MenuItem = {
  key: string;
  label: string;
  description: string;
};

const fallbackMenu: MenuItem[] = [
  { key: "sales", label: "ขาย", description: "ใบเสนอราคา ใบสั่งขาย และลูกค้า" },
  { key: "inventory", label: "คลังสินค้า", description: "สินค้า สต็อก และการโอนย้าย" },
  { key: "purchase", label: "จัดซื้อ", description: "ผู้ขาย ใบสั่งซื้อ และรับสินค้า" },
  { key: "accounting", label: "บัญชี", description: "รายรับ รายจ่าย และรายงานบัญชี" },
  { key: "hr", label: "บุคคล", description: "พนักงาน สิทธิ์ และเวลาทำงาน" },
  { key: "reports", label: "รายงาน", description: "แดชบอร์ดและตัวชี้วัด" }
];

const icons = [
  <ShoppingCartOutlined key="sales" />,
  <AppstoreOutlined key="inventory" />,
  <AuditOutlined key="purchase" />,
  <BankOutlined key="accounting" />,
  <TeamOutlined key="hr" />,
  <BarChartOutlined key="reports" />
];

export default function MainMenuPage() {
  const router = useRouter();
  const [modules, setModules] = useState<MenuItem[]>(fallbackMenu);
  const { data: session } = useSession();
  const isSuperAdmin = session?.user?.role === "super_admin";

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
    const token = session?.accessToken;

    fetch(`${apiUrl}/menu`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined
    })
      .then((response) => (response.ok ? response.json() : fallbackMenu))
      .then((data) => setModules(data))
      .catch(() => setModules(fallbackMenu));
  }, [session?.accessToken]);

  const navItems: MenuProps["items"] = [
    { key: "dashboard", icon: <AppstoreOutlined />, label: "เมนูหลัก" },
    { key: "users", icon: <UserOutlined />, label: "ผู้ใช้งาน" },
    ...(isSuperAdmin
      ? [{ key: "permissions", icon: <SafetyCertificateOutlined />, label: "ตั้งสิทธิ์" }]
      : []),
    { key: "reports", icon: <BarChartOutlined />, label: "รายงาน" }
  ];

  return (
    <Layout className={`${styles.shell} erp-app-shell`}>
      <Layout.Header className={styles.navbar}>
        <div className={styles.brand}>ERP</div>
        <Menu
          className={styles.navMenu}
          mode="horizontal"
          selectedKeys={["dashboard"]}
          onClick={({ key }) => {
            if (key === "permissions") {
              router.push("/settings/user-menu-permissions");
            }
          }}
          items={navItems}
        />
        <div className={styles.profile}>
          <Avatar icon={<UserOutlined />} />
          <span>{session?.user?.name ?? "Admin"}</span>
          <Button icon={<LogoutOutlined />} onClick={() => signOut({ callbackUrl: "/login" })}>
            ออกจากระบบ
          </Button>
        </div>
      </Layout.Header>

      <div className={styles.pageHeader}>
        <div>
          <Typography.Title level={3}>เมนูหลัก ERP</Typography.Title>
          <Typography.Text type="secondary">เลือกโมดูลเพื่อเริ่มทำงาน</Typography.Text>
        </div>
      </div>

      <Layout.Content className={styles.content}>
        <div className={styles.moduleGrid}>
          {modules.map((item, index) => (
            <button className={styles.moduleTile} key={item.key} type="button">
              <span className={styles.moduleIcon}>{icons[index % icons.length]}</span>
              <span className={styles.moduleLabel}>{item.label}</span>
              <span className={styles.moduleDescription}>{item.description}</span>
            </button>
          ))}
        </div>
      </Layout.Content>
    </Layout>
  );
}
