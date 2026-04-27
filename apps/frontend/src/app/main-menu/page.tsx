"use client";

import "@ant-design/v5-patch-for-react-19";
import { useEffect, useState } from "react";
import {
  AppstoreOutlined,
  DatabaseOutlined,
  LogoutOutlined,
  SafetyCertificateOutlined,
  ShoppingCartOutlined,
  TagsOutlined,
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
  path?: string | null;
  children?: MenuItem[];
};

const fallbackMenu: MenuItem[] = [
  {
    key: "master",
    label: "ข้อมูลหลัก",
    description: "ข้อมูลหลัก",
    children: [
      {
        key: "master.customers",
        label: "ลูกค้า",
        description: "สร้างและจัดการข้อมูลลูกค้า",
        path: "/master/customers"
      },
      {
        key: "master.products",
        label: "สินค้า",
        description: "สร้างและจัดการข้อมูลสินค้า",
        path: "/master/products"
      }
    ]
  }
];

const iconByKey: Record<string, React.ReactNode> = {
  master: <DatabaseOutlined />,
  "master.customers": <UserOutlined />,
  "master.products": <TagsOutlined />
};

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
    ...(isSuperAdmin
      ? [{ key: "permissions", icon: <SafetyCertificateOutlined />, label: "ตั้งสิทธิ์" }]
      : [])
  ];

  const openMenu = (item: MenuItem) => {
    if (item.path) {
      router.push(item.path);
    }
  };

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
          <Typography.Text type="secondary">เลือกเมนูหลักและเมนูย่อยเพื่อเริ่มทำงาน</Typography.Text>
        </div>
      </div>

      <Layout.Content className={styles.content}>
        <div className={styles.moduleGrid}>
          {modules.map((item) => (
            <section className={styles.moduleTile} key={item.key}>
              <span className={styles.moduleIcon}>{iconByKey[item.key] ?? <AppstoreOutlined />}</span>
              <span className={styles.moduleLabel}>{item.label}</span>
              <span className={styles.moduleDescription}>{item.description}</span>

              {item.children?.length ? (
                <div className={styles.subMenuList}>
                  {item.children.map((child) => (
                    <button className={styles.subMenuButton} key={child.key} type="button" onClick={() => openMenu(child)}>
                      <span className={styles.subMenuIcon}>{iconByKey[child.key] ?? <ShoppingCartOutlined />}</span>
                      <span>
                        <strong>{child.label}</strong>
                        <small>{child.description}</small>
                      </span>
                    </button>
                  ))}
                </div>
              ) : null}
            </section>
          ))}
        </div>
      </Layout.Content>
    </Layout>
  );
}
