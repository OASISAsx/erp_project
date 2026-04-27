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
- Menu permission ตาม department
- Main menu แสดงเฉพาะเมนูที่ตั้งสิทธิ์ไว้
- `ข้อมูลหลัก` มี submenu:
  - `ลูกค้า`
  - `สินค้า`
- หน้าในกลุ่ม `ข้อมูลหลัก` แสดง submenu เป็น sidebar
- CRUD ลูกค้า
- CRUD สินค้า

## Demo Login

- Email: `admin@erp.local`
- Password: `admin123`

## Progress

ดูรายละเอียดงานที่ทำแล้วและงานถัดไปได้ที่ [docs/PROGRESS.md](docs/PROGRESS.md)
