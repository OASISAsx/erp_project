"use client";

import "@ant-design/v5-patch-for-react-19";
import { useEffect, useState } from "react";
import {
  AppstoreOutlined,
  AuditOutlined,
  BankOutlined,
  BarChartOutlined,
  LogoutOutlined,
  ShoppingCartOutlined,
  TeamOutlined,
  UserOutlined
} from "@ant-design/icons";
import { Avatar, Button, Layout, Menu, Typography } from "antd";
import { signOut } from "next-auth/react";
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
  const [modules, setModules] = useState<MenuItem[]>(fallbackMenu);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

    fetch(`${apiUrl}/menu`)
      .then((response) => (response.ok ? response.json() : fallbackMenu))
      .then((data) => setModules(data))
      .catch(() => setModules(fallbackMenu));
  }, []);

  const logout = () => {
    signOut({ callbackUrl: "/login" });
  };

  return (
    <Layout className={`${styles.shell} erp-app-shell`}>
      <Layout.Sider breakpoint="lg" collapsedWidth="0" className={styles.sider}>
        <div className={styles.logo}>ERP</div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={["dashboard"]}
          items={[
            { key: "dashboard", icon: <AppstoreOutlined />, label: "เมนูหลัก" },
            { key: "users", icon: <UserOutlined />, label: "ผู้ใช้งาน" },
            { key: "reports", icon: <BarChartOutlined />, label: "รายงาน" }
          ]}
        />
      </Layout.Sider>

      <Layout>
        <Layout.Header className={styles.header}>
          <div>
            <Typography.Title level={3}>เมนูหลัก ERP</Typography.Title>
            <Typography.Text type="secondary">เลือกโมดูลเพื่อเริ่มทำงาน</Typography.Text>
          </div>
          <div className={styles.profile}>
            <Avatar icon={<UserOutlined />} />
            <span>Admin</span>
            <Button icon={<LogoutOutlined />} onClick={logout}>
              ออกจากระบบ
            </Button>
          </div>
        </Layout.Header>

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
    </Layout>
  );
}
