"use client";

import "@ant-design/v5-patch-for-react-19";
import { useEffect, useMemo, useState } from "react";
import {
  DeleteOutlined,
  EyeOutlined,
  FilePdfOutlined,
  PlusOutlined
} from "@ant-design/icons";
import {
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useSession } from "next-auth/react";
import { MasterSectionShell } from "@/components/MasterSectionShell";
import { apiClient, getAuthHeaders } from "@/lib/api";
import shellStyles from "@/app/master/master.module.scss";
import styles from "./page.module.scss";

type Customer = { id: string; code: string; name: string };
type Product = { id: string; sku: string; name: string; unit: string; price: number; stock: number };
type OrderItem = {
  id: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  receivedQuantity: number;
  remainingQuantity: number;
  product: Product;
  serials: { id: string; serialNumber: string; warehouseLocation?: string | null }[];
};
type PurchaseOrder = {
  id: string;
  number: string;
  status: string;
  note?: string | null;
  total: number;
  createdAt: string;
  customer: Customer;
  items: OrderItem[];
};

type FormItem = {
  productId?: string;
  quantity?: number;
  unitPrice?: number;
};

type PurchaseForm = {
  customerId: string;
  note?: string;
  items: FormItem[];
};

export default function PurchaseOrdersPage() {
  const { data: session, status } = useSession();
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm<PurchaseForm>();
  const authHeaders = useMemo(() => getAuthHeaders(session?.accessToken), [session?.accessToken]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [previewOrder, setPreviewOrder] = useState<PurchaseOrder | null>(null);

  const loadData = async () => {
    if (status !== "authenticated" || !authHeaders) {
      return;
    }

    setLoading(true);
    try {
      const [customerResponse, productResponse, orderResponse] = await Promise.all([
        apiClient.get<Customer[]>("/master/customers", { headers: authHeaders }),
        apiClient.get<Product[]>("/master/products", { headers: authHeaders }),
        apiClient.get<PurchaseOrder[]>("/purchase-orders", { headers: authHeaders })
      ]);

      setCustomers(customerResponse.data);
      setProducts(productResponse.data);
      setOrders(orderResponse.data);
    } catch {
      messageApi.error("โหลดข้อมูลใบสั่งซื้อไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authHeaders, status]);

  const productById = useMemo(() => new Map(products.map((product) => [product.id, product])), [products]);

  const openCreate = () => {
    form.setFieldsValue({ customerId: undefined as unknown as string, note: "", items: [{}] });
    setCreateOpen(true);
  };

  const submitOrder = async () => {
    if (!authHeaders) {
      return;
    }

    const values = await form.validateFields();
    setSaving(true);
    try {
      const created = await apiClient.post<PurchaseOrder>("/purchase-orders", values, { headers: authHeaders });
      messageApi.success(`สร้างใบสั่งซื้อ ${created.data.number} แล้ว`);
      setCreateOpen(false);
      setPreviewOrder(created.data);
      await loadData();
    } catch {
      messageApi.error("สร้างใบสั่งซื้อไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  };

  const printPreview = () => {
    window.print();
  };

  const columns: ColumnsType<PurchaseOrder> = [
    { title: "เลขที่", dataIndex: "number", render: (value) => <span className={styles.orderNumber}>{value}</span> },
    { title: "ลูกค้า", dataIndex: ["customer", "name"] },
    {
      title: "สถานะ",
      dataIndex: "status",
      render: (value) => <Tag color={value === "received" ? "green" : value === "partial_received" ? "gold" : "blue"}>{value}</Tag>
    },
    { title: "ยอดรวม", dataIndex: "total", align: "right", render: (value) => Number(value).toLocaleString("th-TH") },
    {
      title: "รายการ",
      render: (_, record) => `${record.items.length} รายการ`
    },
    {
      title: "",
      align: "right",
      render: (_, record) => (
        <Space>
          <Button icon={<EyeOutlined />} onClick={() => setPreviewOrder(record)}>ดูภาพรวม</Button>
        </Space>
      )
    }
  ];

  return (
    <MasterSectionShell mainMenuKey="purchase">
      {contextHolder}
      <section className={shellStyles.panel}>
        <div className={styles.toolbar}>
          <div>
            <Typography.Title level={3}>ใบสั่งซื้อ</Typography.Title>
            <Typography.Text type="secondary">Create purchase order with Running Number, then warehouse receives stock and scans SN.</Typography.Text>
          </div>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            สร้างใบสั่งซื้อ
          </Button>
        </div>

        <Table rowKey="id" columns={columns} dataSource={orders} loading={loading} pagination={{ pageSize: 8 }} />
      </section>

      <Modal
        title="สร้างใบสั่งซื้อ"
        open={createOpen}
        width={920}
        okText="สร้างใบสั่งซื้อ"
        cancelText="ยกเลิก"
        confirmLoading={saving}
        onCancel={() => setCreateOpen(false)}
        onOk={submitOrder}
      >
        <Form form={form} layout="vertical" initialValues={{ items: [{}] }}>
          <div className={styles.formGrid}>
            <Form.Item name="customerId" label="ลูกค้า" rules={[{ required: true, message: "เลือกลูกค้า" }]}>
              <Select
                showSearch
                placeholder="เลือกลูกค้า"
                optionFilterProp="label"
                options={customers.map((customer) => ({ value: customer.id, label: `${customer.code} - ${customer.name}` }))}
              />
            </Form.Item>
            <Form.Item name="note" label="หมายเหตุ">
              <Input />
            </Form.Item>
          </div>

          <Form.List name="items">
            {(fields, { add, remove }) => (
              <div className={styles.itemsBox}>
                <div className={styles.toolbar}>
                  <Typography.Text strong>สินค้าในใบสั่งซื้อ</Typography.Text>
                  <Button icon={<PlusOutlined />} onClick={() => add({})}>เพิ่มสินค้า</Button>
                </div>
                {fields.map((field) => {
                  const { key, ...fieldProps } = field;

                  return (
                    <div className={styles.itemRow} key={key}>
                      <Form.Item
                        {...fieldProps}
                        key={`${key}-product`}
                        name={[field.name, "productId"]}
                        rules={[{ required: true, message: "เลือกสินค้า" }]}
                      >
                        <Select
                          showSearch
                          placeholder="สินค้า"
                          optionFilterProp="label"
                          options={products.map((product) => ({
                            value: product.id,
                            label: `${product.sku} - ${product.name} (คงเหลือ ${product.stock})`
                          }))}
                          onChange={(productId) => {
                            const product = productById.get(productId);
                            const currentItems = form.getFieldValue("items") ?? [];
                            currentItems[field.name] = {
                              ...currentItems[field.name],
                              unitPrice: product?.price ?? 0
                            };
                            form.setFieldsValue({ items: currentItems });
                          }}
                        />
                      </Form.Item>
                      <Form.Item
                        {...fieldProps}
                        key={`${key}-quantity`}
                        name={[field.name, "quantity"]}
                        rules={[{ required: true, message: "จำนวน" }]}
                      >
                        <InputNumber min={1} placeholder="จำนวน" style={{ width: "100%" }} />
                      </Form.Item>
                      <Form.Item
                        {...fieldProps}
                        key={`${key}-unit-price`}
                        name={[field.name, "unitPrice"]}
                        rules={[{ required: true, message: "ราคา" }]}
                      >
                        <InputNumber min={0} placeholder="ราคา" style={{ width: "100%" }} />
                      </Form.Item>
                      <Button danger icon={<DeleteOutlined />} onClick={() => remove(field.name)} />
                    </div>
                  );
                })}
              </div>
            )}
          </Form.List>
        </Form>
      </Modal>

      <Modal
        title="ภาพรวมใบสั่งซื้อ"
        open={Boolean(previewOrder)}
        width={980}
        okText="ปิด"
        cancelButtonProps={{ style: { display: "none" } }}
        onOk={() => setPreviewOrder(null)}
        onCancel={() => setPreviewOrder(null)}
        footer={[
          <Button key="print" icon={<FilePdfOutlined />} onClick={printPreview}>พิมพ์/PDF</Button>,
          <Button key="close" type="primary" onClick={() => setPreviewOrder(null)}>ปิด</Button>
        ]}
      >
        {previewOrder ? (
          <div className={styles.preview}>
            <div className={styles.document}>
              <div className={styles.documentHeader}>
                <div>
                  <h2 className={styles.documentTitle}>Purchase Order</h2>
                  <Typography.Text>{previewOrder.number}</Typography.Text>
                </div>
                <div>
                  <Typography.Text strong>{previewOrder.customer.name}</Typography.Text>
                  <br />
                  <Typography.Text type="secondary">{previewOrder.customer.code}</Typography.Text>
                </div>
              </div>
              <Table
                rowKey="id"
                pagination={false}
                dataSource={previewOrder.items}
                columns={[
                  { title: "สินค้า", render: (_, item) => `${item.product.sku} - ${item.product.name}` },
                  { title: "จำนวน", dataIndex: "quantity", align: "right" },
                  { title: "รับแล้ว", dataIndex: "receivedQuantity", align: "right" },
                  { title: "ราคา", dataIndex: "unitPrice", align: "right", render: (value) => Number(value).toLocaleString("th-TH") },
                  { title: "รวม", dataIndex: "amount", align: "right", render: (value) => Number(value).toLocaleString("th-TH") }
                ]}
              />
              <div className={styles.summary}>
                <div className={styles.summaryLine}>
                  <span>ยอดรวม</span>
                  <strong>{previewOrder.total.toLocaleString("th-TH", { minimumFractionDigits: 2 })}</strong>
                </div>
                <Typography.Text type="secondary">{previewOrder.note || "ไม่มีหมายเหตุ"}</Typography.Text>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </MasterSectionShell>
  );
}
