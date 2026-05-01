"use client";

import "@ant-design/v5-patch-for-react-19";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  AppstoreOutlined,
  FileTextOutlined,
  HomeOutlined,
  LogoutOutlined,
  QrcodeOutlined,
  TagsOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Avatar, Button, Layout, Menu, Typography } from "antd";
import type { MenuProps } from "antd";
import { signOut, useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import styles from "@/app/master/master.module.scss";
import type { MenuItem } from "@/types/menu";

type MasterSectionShellProps = {
  children: ReactNode;
  mainMenuKey?: string;
};

const iconByKey: Record<string, ReactNode> = {
  "master.customers": <UserOutlined />,
  "master.products": <TagsOutlined />,
  "sales.orders": <FileTextOutlined />,
  "purchase.orders": <FileTextOutlined />,
  "warehouse.receiving": <QrcodeOutlined />,
};

const mainMenuFallbackLabels: Record<string, string> = {
  master: "ข้อมูลหลัก",
  sales: "ใบสั่งขาย",
  purchase: "ใบสั่งซื้อ",
  warehouse: "คลังสินค้า",
};

export function MasterSectionShell({
  children,
  mainMenuKey = "master",
}: MasterSectionShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [menus, setMenus] = useState<MenuItem[]>([]);

  useEffect(() => {
    if (status !== "authenticated" || !session?.accessToken) {
      setMenus([]);
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

    fetch(`${apiUrl}/menu`, {
      headers: { Authorization: `Bearer ${session.accessToken}` },
    })
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data: MenuItem[]) => setMenus(data))
      .catch(() => setMenus([]));
  }, [session?.accessToken, status]);

  const mainMenu = useMemo(
    () => menus.find((item) => item.key === mainMenuKey),
    [mainMenuKey, menus],
  );
  const subMenus = mainMenu?.children ?? [];

  const sidebarItems: MenuProps["items"] = subMenus.map((item) => ({
    key: item.path ?? item.key,
    icon: iconByKey[item.key] ?? <AppstoreOutlined />,
    label: item.label,
  }));

  const selectedKeys = subMenus
    .filter((item) => item.path && pathname.startsWith(item.path))
    .map((item) => item.path as string);

  return (
    <Layout className={styles.shell}>
      <Layout.Header className={styles.navbar}>
        <div className={styles.brand}>ERP</div>
        <Button
          icon={<HomeOutlined />}
          onClick={() => router.push("/dashboard")}
        >
          แดชบอร์ด
        </Button>
        <Button
          icon={<AppstoreOutlined />}
          onClick={() => router.push("/main-menu")}
        >
          เมนูหลัก
        </Button>
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

      <Layout className={styles.body}>
        <Layout.Sider
          className={styles.sidebar}
          width={240}
          breakpoint="lg"
          collapsedWidth={0}
        >
          <div className={styles.sidebarTitle}>
            <Typography.Text strong>
              {mainMenu?.label ?? mainMenuFallbackLabels[mainMenuKey] ?? "ERP"}
            </Typography.Text>
            <Typography.Text type="secondary">
              {subMenus.length} เมนูย่อย
            </Typography.Text>
          </div>
          <Menu
            className={styles.sidebarMenu}
            mode="inline"
            selectedKeys={selectedKeys}
            items={sidebarItems}
            onClick={({ key }) => router.push(String(key))}
          />
        </Layout.Sider>

        <Layout.Content className={styles.content}>{children}</Layout.Content>
      </Layout>
    </Layout>
  );
}
