"use client";

import "@ant-design/v5-patch-for-react-19";
import { useEffect, useState } from "react";
import {
  AppstoreOutlined,
  DatabaseOutlined,
  FileTextOutlined,
  HomeOutlined,
  InboxOutlined,
  LogoutOutlined,
  SafetyCertificateOutlined,
  ShoppingCartOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Avatar, Button, Empty, Layout, Menu, Typography } from "antd";
import type { MenuProps } from "antd";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import styles from "./page.module.scss";

type MenuItem = {
  key: string;
  label: string;
  description: string;
  path?: string | null;
  children?: MenuItem[];
};

const iconByKey: Record<string, React.ReactNode> = {
  master: <DatabaseOutlined />,
  purchase: <FileTextOutlined />,
  warehouse: <InboxOutlined />,
};

export default function MainMenuPage() {
  const router = useRouter();
  const [modules, setModules] = useState<MenuItem[]>([]);
  const { data: session, status } = useSession();
  const isSuperAdmin = session?.user?.role === "super_admin";

  useEffect(() => {
    if (status !== "authenticated" || !session?.accessToken) {
      setModules([]);
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

    fetch(`${apiUrl}/menu`, {
      headers: { Authorization: `Bearer ${session.accessToken}` },
    })
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data: MenuItem[]) => setModules(data))
      .catch(() => setModules([]));
  }, [session?.accessToken, status]);

  const navItems: MenuProps["items"] = [
    { key: "dashboard", icon: <HomeOutlined />, label: "แดชบอร์ด" },
    { key: "main-menu", icon: <AppstoreOutlined />, label: "เมนูหลัก" },
    ...(isSuperAdmin
      ? [
          {
            key: "permissions",
            icon: <SafetyCertificateOutlined />,
            label: "ตั้งสิทธิ์",
          },
        ]
      : []),
  ];

  const openMenu = (item: MenuItem) => {
    const path =
      item.path ??
      item.children?.find((child) => child.path)?.path ??
      (item.key === "master"
        ? "/master"
        : item.key === "purchase"
          ? "/purchase"
          : item.key === "warehouse"
            ? "/warehouse"
            : item.key === "sales"
              ? "/sales"
              : null);

    if (path) {
      router.push(path);
    }
  };

  return (
    <Layout className={`${styles.shell} erp-app-shell`}>
      <Layout.Header className={styles.navbar}>
        <div className={styles.brand}>ERP</div>
        <Menu
          className={styles.navMenu}
          mode="horizontal"
          selectedKeys={["main-menu"]}
          onClick={({ key }) => {
            if (key === "dashboard") {
              router.push("/dashboard");
            }

            if (key === "permissions") {
              router.push("/settings/user-menu-permissions");
            }
          }}
          items={navItems}
        />
        <div className={styles.profile}>
          <Avatar icon={<UserOutlined />} />
          <span>{session?.user?.name ?? "Admin"}</span>
          <Button
            icon={<LogoutOutlined />}
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            ออกจากระบบ
          </Button>
        </div>
      </Layout.Header>

      <div className={styles.pageHeader}>
        <div>
          <Typography.Title level={3}>เมนูหลัก ERP</Typography.Title>
          <Typography.Text type="secondary">
            เลือกโมดูลหลักเพื่อเริ่มทำงาน
          </Typography.Text>
        </div>
      </div>

      <Layout.Content className={styles.content}>
        {modules.length ? (
          <div className={styles.moduleGrid}>
            {modules.map((item) => (
              <button
                className={styles.moduleTile}
                key={item.key}
                type="button"
                onClick={() => openMenu(item)}
              >
                <span className={styles.moduleIcon}>
                  {iconByKey[item.key] ?? <ShoppingCartOutlined />}
                </span>
                <span className={styles.moduleLabel}>{item.label}</span>
                <span className={styles.moduleDescription}>
                  {item.description}
                </span>
                {item.children?.length ? (
                  <span className={styles.moduleMeta}>
                    {item.children.length} เมนูย่อย
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        ) : (
          <Empty description="ยังไม่มีเมนูที่เปิดสิทธิ์ให้ใช้งาน" />
        )}
      </Layout.Content>
    </Layout>
  );
}
