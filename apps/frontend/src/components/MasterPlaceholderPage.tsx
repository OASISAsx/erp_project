"use client";

import "@ant-design/v5-patch-for-react-19";
import { AppstoreOutlined, LogoutOutlined, PlusOutlined, UserOutlined } from "@ant-design/icons";
import { Avatar, Button, Layout, Typography } from "antd";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import styles from "@/app/master/master.module.scss";

type MasterPlaceholderPageProps = {
  title: string;
  description: string;
  createLabel: string;
};

export function MasterPlaceholderPage({
  title,
  description,
  createLabel
}: MasterPlaceholderPageProps) {
  const router = useRouter();
  const { data: session } = useSession();

  return (
    <Layout className={styles.shell}>
      <Layout.Header className={styles.navbar}>
        <div className={styles.brand}>ERP</div>
        <Button icon={<AppstoreOutlined />} onClick={() => router.push("/master")}>
          ข้อมูลหลัก
        </Button>
        <Button icon={<AppstoreOutlined />} onClick={() => router.push("/main-menu")}>
          เมนูหลัก
        </Button>
        <div className={styles.profile}>
          <Avatar icon={<UserOutlined />} />
          <span>{session?.user?.name ?? "Admin"}</span>
          <Button icon={<LogoutOutlined />} onClick={() => signOut({ callbackUrl: "/login" })}>
            ออกจากระบบ
          </Button>
        </div>
      </Layout.Header>

      <Layout.Content className={styles.content}>
        <section className={styles.panel}>
          <Typography.Title level={3}>{title}</Typography.Title>
          <Typography.Text type="secondary">{description}</Typography.Text>
          <div style={{ marginTop: 24 }}>
            <Button type="primary" icon={<PlusOutlined />}>
              {createLabel}
            </Button>
          </div>
        </section>
      </Layout.Content>
    </Layout>
  );
}
