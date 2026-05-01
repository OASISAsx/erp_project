"use client";

import { Tag } from "antd";
import { MasterCrudPage } from "@/components/MasterCrudPage";
import type { MasterField } from "@/types/master";

const fields: MasterField[] = [
  { name: "code", label: "รหัสลูกค้า", required: true, width: 140 },
  { name: "name", label: "ชื่อลูกค้า", required: true, width: 220 },
  { name: "email", label: "อีเมล", width: 220 },
  { name: "phone", label: "โทรศัพท์", width: 150 },
  { name: "address", label: "ที่อยู่", type: "textarea", width: 260 },
  {
    name: "isActive",
    label: "สถานะ",
    type: "switch",
    width: 110,
    render: (value) => <Tag color={value ? "green" : "default"}>{value ? "ใช้งาน" : "ปิด"}</Tag>
  }
];

export default function CustomersPage() {
  return (
    <MasterCrudPage
      title="ลูกค้า"
      description="สร้าง แก้ไข และลบข้อมูลลูกค้าขององค์กร"
      endpoint="/master/customers"
      createLabel="สร้างลูกค้า"
      fields={fields}
      initialValues={{ isActive: true }}
    />
  );
}
