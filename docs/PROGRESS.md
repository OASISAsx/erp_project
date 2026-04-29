# ERP Project Progress

อัปเดตล่าสุด: 2026-04-27

## Tech Stack

- Frontend: Next 16, React 19, Ant Design 5, SCSS
- Frontend state/API: NextAuth, Axios, Zustand
- Backend: NestJS
- Database: PostgreSQL
- ORM: Prisma ORM 7
- Architecture: NPM workspaces monorepo

## Completed

### Project Setup

- สร้าง monorepo structure:
  - `apps/frontend`
  - `apps/backend`
  - `docs`
- เพิ่ม root workspace scripts สำหรับ dev/build/lint
- เพิ่ม Prisma config สำหรับ PostgreSQL ผ่าน `DATABASE_URL`
- เพิ่ม Prisma generated client ใน backend
- เพิ่ม migration สำหรับเมนู, submenu, permission, ลูกค้า และสินค้า

### Authentication

- สร้างหน้า Login ด้วย Ant Design
- สร้างหน้า Register ด้วย Ant Design
- ใช้ NextAuth Credentials provider
- Login เรียก backend `/auth/login`
- Register เรียก backend `/auth/register`
- เก็บ session ด้วย NextAuth JWT session
- ส่ง backend access token ไปกับ API ที่ต้องใช้สิทธิ์
- ป้องกัน route:
  - `/main-menu`
  - `/master`
  - `/settings`
- Backend auth ใช้ bcrypt และ JWT guard

### Menu And Permission

- สร้างตาราง department
- สร้างตารางเมนูหลัก `erp_menus`
- สร้างตาราง submenu `erp_sub_menus`
- สร้างตารางสิทธิ์เมนูหลัก `department_menu_permissions`
- สร้างตารางสิทธิ์ submenu `department_sub_menu_permissions`
- สร้าง API สำหรับ admin:
  - `GET /admin/users`
  - `PATCH /admin/users/:id/department`
  - `GET /admin/departments`
  - `POST /admin/departments`
  - `GET /admin/menu-permissions`
  - `PUT /admin/menu-permissions/:departmentId`
- สร้างหน้า `/settings/user-menu-permissions`
  - เพิ่มแผนก
  - assign user เข้าแผนก
  - เลือกสิทธิ์เมนูหลักและ submenu แบบ tree
  - ใช้ Axios และ Zustand store
- `/menu` แสดงเฉพาะเมนูที่ department ของ user ถูกตั้งสิทธิ์ไว้
- `super_admin` ไม่ bypass menu permission แล้ว เห็นเฉพาะเมนูที่ set ให้ department ตัวเอง
- Frontend จะ fetch `/menu` เฉพาะตอน NextAuth session authenticated และมี access token แล้ว
- Backend `/menu` ถ้าไม่มี token/user จะตอบ `[]` ไม่ส่งเมนูทั้งหมด

### Main Menu

- สร้างหน้า `/dashboard`
  - เป็นหน้าแรกหลัง login
  - มีรูปโปรโมทจาก asset ในโปรเจ็ค
  - มี quick links ไปเมนูหลัก, ลูกค้า และสินค้า
  - มีปฏิทิน mockup รายเดือน
  - มี mockup อากาศวันนี้
- ปรับ Login/Register redirect ไป `/dashboard`
- สร้างหน้า `/main-menu`
- แสดงเฉพาะเมนูหลักที่ user มีสิทธิ์
- เอา sidebar ออก
- ย้ายปุ่ม `ตั้งสิทธิ์` ไป navbar
- ปุ่ม `ตั้งสิทธิ์` แสดงเฉพาะ `super_admin`
- เมนู `ข้อมูลหลัก` กดเข้า `/master`

### Master Data Menu

- สร้างหน้า `/master`
- แสดง submenu ที่ user มีสิทธิ์เท่านั้น
- แสดง submenu ของ `ข้อมูลหลัก` เป็น sidebar ในหน้า `/master` และหน้าลูกทั้งหมด
- เพิ่ม submenu:
  - `ลูกค้า` -> `/master/customers`
  - `สินค้า` -> `/master/products`

### Customer CRUD

- เพิ่ม Prisma model `Customer`
- เพิ่ม table `customers`
- Fields:
  - `code`
  - `name`
  - `email`
  - `phone`
  - `address`
  - `isActive`
- เพิ่ม backend API:
  - `GET /master/customers`
  - `POST /master/customers`
  - `PATCH /master/customers/:id`
  - `DELETE /master/customers/:id`
- สร้างหน้า `/master/customers`
  - แสดงตารางลูกค้า
  - สร้างลูกค้า
  - แก้ไขลูกค้า
  - ลบลูกค้า

### Product CRUD

- เพิ่ม Prisma model `Product`
- เพิ่ม table `products`
- Fields:
  - `sku`
  - `name`
  - `description`
  - `unit`
  - `price`
  - `stock`
  - `isActive`
- เพิ่ม backend API:
  - `GET /master/products`
  - `POST /master/products`
  - `PATCH /master/products/:id`
  - `DELETE /master/products/:id`
- สร้างหน้า `/master/products`
  - แสดงตารางสินค้า
  - สร้างสินค้า
  - แก้ไขสินค้า
  - ลบสินค้า

### Purchase Order

- เพิ่มเมนูหลัก `ใบสั่งซื้อ`
- เพิ่ม submenu `ใบสั่งซื้อ` -> `/purchase/orders`
- เพิ่ม Prisma models:
  - `DocumentCounter` สำหรับ Running Number
  - `PurchaseOrder`
  - `PurchaseOrderItem`
  - `ProductSerial`
- เพิ่ม migration `202604290001_add_purchase_orders`
- Running Number รูปแบบ `PO-YYYYMM-0001`
- เพิ่ม backend API:
  - `GET /purchase-orders`
  - `GET /purchase-orders/:id`
  - `POST /purchase-orders`
  - `POST /purchase-orders/:id/serials`
- สร้างหน้า `/purchase/orders`
  - เลือกลูกค้า
  - เลือกสินค้า
  - ระบุจำนวนและราคา
  - สร้างใบสั่งซื้อ
  - ดูภาพรวมใบสั่งซื้อ
  - พิมพ์/PDF ผ่าน browser print
  - ยิง Serial Number ของแต่ละสินค้าเข้าคลัง
  - เพิ่ม stock สินค้าตามจำนวน Serial Number ที่รับเข้า

### Warehouse Receiving

- เพิ่มเมนูหลัก `คลังสินค้า`
- เพิ่ม submenu `รับสินค้าเข้า` -> `/warehouse/receiving`
- หน้า warehouse จะดึงใบงานจาก PO ที่สร้างไว้
- คนคลังเลือกใบงาน แล้วเห็นสินค้าแต่ละตัว จำนวน PO, รับแล้ว, ค้างรับ และ SN ล่าสุด
- สแกนหรือกรอก SN แยกตามสินค้า แล้วบันทึกผ่าน API `POST /purchase-orders/:id/serials`
- ระบบเดิมจะตรวจ duplicate SN, อัปเดตสถานะ PO และเพิ่ม stock ตามจำนวน SN ที่รับเข้า

### Latest Warehouse Scan Update

- SN receiving is handled only in warehouse, not in the purchase order page.
- Purchase order page now focuses on create, preview, and browser print/PDF only.
- Scan dialog uses a normal AntD Input: scan/type one SN and press Enter to push it into the preview DataTable.
- Preview DataTable shows Serial Number, scanned user from session, warehouse location, and delete action before saving.
- Save sends only the SN rows currently in the DataTable to `POST /purchase-orders/:id/serials`.

## Important Commands

```bash
npm install
npm run dev
npm run build
npm run prisma:migrate -w apps/backend
npm run prisma:generate -w apps/backend
```

## Current Database Migrations

- `202604270001_add_erp_sub_menus`
  - สร้าง `erp_sub_menus`
  - สร้าง `department_sub_menu_permissions`
- `202604270002_add_customers_products`
  - สร้าง `customers`
  - สร้าง `products`
- `202604290001_add_purchase_orders`
  - สร้าง `document_counters`
  - สร้าง `purchase_orders`
  - สร้าง `purchase_order_items`
  - สร้าง `product_serials`

## Notes

- หลัง migrate ต้อง restart backend
- ก่อน user จะเห็นเมนู ต้อง assign department ให้ user และตั้งสิทธิ์เมนูให้ department นั้นก่อน
- `super_admin` ยังเข้า setting permission ได้ แต่เมนูใช้งานจริงยังยึดตาม department permission
- Ant Design ใช้ `@ant-design/v5-patch-for-react-19` เพราะโปรเจ็คใช้ React 19 ผ่าน Next 16

## Next Tasks

- เพิ่ม permission guard ราย endpoint สำหรับ customer/product ตาม submenu permission
- เพิ่ม permission guard ราย endpoint สำหรับ purchase order และ stock serial
- เพิ่ม search/filter ในหน้าลูกค้าและสินค้า
- เพิ่ม search/filter ในหน้าใบสั่งซื้อ
- เพิ่ม soft delete หรือ audit log แทนการ delete จริง
- เพิ่ม pagination ฝั่ง backend
- เพิ่ม seed script สำหรับเมนูเริ่มต้นและ admin user
- เพิ่ม validation duplicate error message ให้ frontend อ่านง่าย
- เพิ่ม unit/e2e tests สำหรับ auth, menu permission, customer และ product
