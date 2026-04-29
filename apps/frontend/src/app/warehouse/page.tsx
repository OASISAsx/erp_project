"use client";

import "@ant-design/v5-patch-for-react-19";
import { InboxOutlined } from "@ant-design/icons";
import { Empty, Typography } from "antd";
import { MasterSectionShell } from "@/components/MasterSectionShell";
import styles from "@/app/master/master.module.scss";

export default function WarehousePage() {
  return (
    <MasterSectionShell mainMenuKey="warehouse">
      <div className={styles.pageHeader}>
        <Typography.Title level={3}>คลังสินค้า</Typography.Title>
        <Typography.Text type="secondary">เลือกเมนูย่อยจาก sidebar เพื่อรับสินค้าและสแกน SN เข้าคลัง</Typography.Text>
      </div>
      <section className={styles.panel}>
        <Empty image={<InboxOutlined className={styles.emptyIcon} />} description="เลือก รับสินค้าเข้า จาก sidebar" />
      </section>
    </MasterSectionShell>
  );
}
