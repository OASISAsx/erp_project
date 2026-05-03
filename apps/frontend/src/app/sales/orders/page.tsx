"use client";

import "@ant-design/v5-patch-for-react-19";
import { FileTextOutlined } from "@ant-design/icons";
import { Empty, Typography } from "antd";
import { MasterSectionShell } from "@/components/MasterSectionShell";
import styles from "@/app/master/master.module.scss";

export default function SalesOrdersPage() {
  
  return (
    <MasterSectionShell mainMenuKey="sales">
      <div className={styles.pageHeader}>
        <Typography.Title level={3}>ใบสั่งขาย</Typography.Title>
        <Typography.Text type="secondary">
          หน้าสร้างและติดตามใบสั่งขาย
        </Typography.Text>
      </div>
      <section className={styles.panel}>
        <Empty
          image={<FileTextOutlined className={styles.emptyIcon} />}
          description="ยังไม่มีฟอร์มใบสั่งขาย"
        />
      </section>
    </MasterSectionShell>
  );
}
