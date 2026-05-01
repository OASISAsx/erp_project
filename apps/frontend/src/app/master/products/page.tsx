"use client";

import { Tag } from "antd";
import { MasterCrudPage } from "@/components/MasterCrudPage";
import type { MasterField } from "@/types/master";

const fields: MasterField[] = [
  { name: "sku", label: "SKU", required: true, width: 140 },
  { name: "name", label: "ชื่อสินค้า", required: true, width: 220 },
  { name: "description", label: "รายละเอียด", type: "textarea", width: 260 },
  { name: "unit", label: "หน่วย", required: true, width: 110 },
  {
    name: "price",
    label: "ราคา",
    type: "number",
    required: true,
    width: 130,
    render: (value) => Number(value ?? 0).toLocaleString("th-TH", { minimumFractionDigits: 2 })
  },
  { name: "stock", label: "คงเหลือ", type: "number", required: true, width: 110 },
  {
    name: "isActive",
    label: "สถานะ",
    type: "switch",
    width: 110,
    render: (value) => <Tag color={value ? "green" : "default"}>{value ? "ใช้งาน" : "ปิด"}</Tag>
  }
];

export default function ProductsPage() {
  return (
    <MasterCrudPage
      title="สินค้า"
      description="สร้าง แก้ไข และลบข้อมูลสินค้าและบริการ"
      endpoint="/master/products"
      createLabel="สร้างสินค้า"
      fields={fields}
      initialValues={{ unit: "ชิ้น", price: 0, stock: 0, isActive: true }}
    />
  );
}
