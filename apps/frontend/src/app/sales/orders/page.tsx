"use client";

import "@ant-design/v5-patch-for-react-19";
import { FileTextOutlined } from "@ant-design/icons";
import { Button, Empty, Form, Input, Modal, Table, Typography } from "antd";
import { MasterSectionShell } from "@/components/MasterSectionShell";
import styles from "@/app/master/master.module.scss";
import { useState } from "react";
import OrderViewModal from "./modalSale";
import { SalesOrdersPageProps } from "@/types/sales.type";

const sampleData: SalesOrdersPageProps[] = [
  {
    id: 1,
    transactionNo: "SO-0001",
    customerName: "บริษัท ตัวอย่าง จำกัด",
    orderDate: "2024-01-01",
    status: "draft",
  },
  {
    id: 2,
    transactionNo: "SO-0002",
    customerName: "ห้างหุ้นส่วนจำกัด ทดสอบ",
    orderDate: "2024-01-05",
    status: "confirmed",
  },
  {
    id: 3,
    transactionNo: "SO-0003",
    customerName: "บริษัท ทดสอบ จำกัด",
    orderDate: "2024-01-10",
    status: "shipped",
  },
];
export default function SalesOrdersPage() {
  const [form] = Form.useForm<SalesOrdersPageProps>();
  const [openDialog, setOpenDialog] = useState(false);
  const [payload, setPayload] = useState<SalesOrdersPageProps | null>(null);
  const onSubmit = (values: SalesOrdersPageProps) => {
    console.log("Form submitted:", values);
  };
  const viewDialog = (record: SalesOrdersPageProps) => {
    console.log("View record:", record);
    setPayload(record);
    setOpenDialog(true);
  };

  return (
    <MasterSectionShell mainMenuKey="sales">
      <div className={styles.pageHeader}>
        <Typography.Title level={3}>ใบสั่งขาย</Typography.Title>
        <Typography.Text type="secondary">
          หน้าสร้างและติดตามใบสั่งขาย
        </Typography.Text>
      </div>
      <section className={styles.panel}>
        <Table
          rowKey="id"
          dataSource={sampleData}
          columns={[
            {
              title: "เลขที่เอกสาร",
              dataIndex: "transactionNo",
              key: "transactionNo",
            },
            {
              title: "ชื่อลูกค้า",
              dataIndex: "customerName",
              key: "customerName",
            },
            {
              title: "วันที่สั่งซื้อ",
              dataIndex: "orderDate",
              key: "orderDate",
            },
            { title: "สถานะ", dataIndex: "status", key: "status" },
            {
              title: "Actions",
              key: "actions",
              render: (record: SalesOrdersPageProps) => (
                <Button type="primary" onClick={() => viewDialog(record)}>
                  View
                </Button>
              ),
            },
          ]}
          locale={{ emptyText: <Empty description="ไม่มีใบสั่งขาย" /> }}
        />
        <OrderViewModal
          open={openDialog}
          order={payload}
          onClose={() => setOpenDialog(false)}
        />
        {/* <Form<SalesOrdersPageProps>
          form={form}
          layout="vertical"
          className={styles.form}
          onFinish={onSubmit}
        >
          <Form.Item label="เลขที่เอกสาร" name="transactionNo">
            <Input prefix={<FileTextOutlined />} placeholder="SO-0001" />
          </Form.Item>
          <Form.Item label="ชื่อลูกค้า" name="customerName">
            <Input placeholder="บริษัท ตัวอย่าง จำกัด" />
          </Form.Item>
          <Form.Item label="วันที่สั่งซื้อ" name="orderDate">
            <Input placeholder="2024-01-01" />
          </Form.Item>
          <Form.Item label="สถานะ" name="status">
            <Input placeholder="draft" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form> */}
      </section>
    </MasterSectionShell>
  );
}
