"use client";

import "@ant-design/v5-patch-for-react-19";
import { AppstoreOutlined } from "@ant-design/icons";
import { Empty, Typography } from "antd";
import { MasterSectionShell } from "@/components/MasterSectionShell";
import styles from "./master.module.scss";

export default function MasterPage() {
  return (
    <MasterSectionShell>
      <div className={styles.pageHeader}>
        <Typography.Title level={3}>ข้อมูลหลัก</Typography.Title>
        <Typography.Text type="secondary">เลือกเมนูย่อยจากแถบด้านซ้ายเพื่อเริ่มจัดการข้อมูล</Typography.Text>
      </div>

      <section className={styles.panel}>
        <Empty image={<AppstoreOutlined className={styles.emptyIcon} />} description="เลือก ลูกค้า หรือ สินค้า จาก sidebar" />
      </section>
    </MasterSectionShell>
  );
}
