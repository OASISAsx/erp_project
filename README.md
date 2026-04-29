# ERP Platform

Monorepo สำหรับโปรเจ็ค ERP

- Frontend: Next 16, React, Ant Design, SCSS, NextAuth, Axios, Zustand
- Backend: NestJS, Prisma ORM 7
- Database: PostgreSQL

## Run

```bash
npm install
npm run dev
```

Frontend: http://localhost:3000  
Backend: http://localhost:4000

## Database

หลังแก้ schema หรือหลัง clone โปรเจ็ค ให้ migrate และ generate Prisma client:

```bash
npm run prisma:migrate -w apps/backend
npm run prisma:generate -w apps/backend
```

## Current Features

- Login/Register ผ่าน NextAuth Credentials และ backend NestJS
- Dashboard หลังเข้าสู่ระบบ พร้อมรูปโปรโมท, ปฏิทิน และ mockup อากาศวันนี้
- Menu permission ตาม department
- Main menu แสดงเฉพาะเมนูที่ตั้งสิทธิ์ไว้
- `ข้อมูลหลัก` มี submenu:
  - `ลูกค้า`
  - `สินค้า`
- หน้าในกลุ่ม `ข้อมูลหลัก` แสดง submenu เป็น sidebar
- CRUD ลูกค้า
- CRUD สินค้า
- ใบสั่งซื้อพร้อม Running Number
- เลือกลูกค้าและสินค้าในใบสั่งซื้อ
- รับ Serial Number ของสินค้าเข้าคลังและเพิ่ม stock
- ดูภาพรวมใบสั่งซื้อและพิมพ์/PDF ผ่าน browser print

- เมนูคลังสินค้า `/warehouse/receiving` สำหรับเลือกใบงานจาก PO และสแกน SN แยกตามสินค้า

## Demo Login

- Email: `admin@erp.local`
- Password: `admin123`

## Progress

ดูรายละเอียดงานที่ทำแล้วและงานถัดไปได้ที่ [docs/PROGRESS.md](docs/PROGRESS.md)
