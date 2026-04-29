"use client";

import "@ant-design/v5-patch-for-react-19";
import {
  AppstoreOutlined,
  CalendarOutlined,
  CloudOutlined,
  LogoutOutlined,
  NotificationOutlined,
  ShopOutlined,
  SunOutlined,
  TagsOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Avatar, Button, Layout, Typography } from "antd";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import styles from "./page.module.scss";

const weekdays = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];
const monthNames = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
];

function buildCalendar() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const previousMonthDays = new Date(year, month, 0).getDate();
  const cells = [];

  for (let index = 0; index < 42; index += 1) {
    const dayNumber = index - startOffset + 1;

    if (dayNumber < 1) {
      cells.push({
        label: previousMonthDays + dayNumber,
        muted: true,
        today: false,
        hasEvent: false,
      });
    } else if (dayNumber > daysInMonth) {
      cells.push({ label: dayNumber - daysInMonth, muted: true, today: false, hasEvent: false });
    } else {
      cells.push({
        label: dayNumber,
        muted: false,
        today: dayNumber === today.getDate(),
        hasEvent: [3, 9, 15, 22, 28].includes(dayNumber),
      });
    }
  }

  return {
    title: `${monthNames[month]} ${year + 543}`,
    cells,
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const calendar = buildCalendar();

  return (
    <Layout className={`${styles.shell} erp-app-shell`}>
      <Layout.Header className={styles.navbar}>
        <div className={styles.brand}>ERP</div>
        <div className={styles.navActions}>
          <Button
            type="primary"
            icon={<AppstoreOutlined />}
            onClick={() => router.push("/main-menu")}
          >
            เมนูหลัก
          </Button>
          <Button
            icon={<ShopOutlined />}
            onClick={() => router.push("/master")}
          >
            ข้อมูลหลัก
          </Button>
        </div>
        <div className={styles.profile}>
          <Avatar icon={<UserOutlined />} />
          <span>{session?.user?.name ?? "Admin"}</span>
          <Button
            icon={<LogoutOutlined />}
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            ออกจากระบบ
          </Button>
        </div>
      </Layout.Header>

      <Layout.Content className={styles.content}>
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <Typography.Title level={2}>แดชบอร์ด ERP</Typography.Title>
            <Typography.Paragraph
              style={{ color: "rgba(255,255,255,0.82)", margin: 0 }}
            >
              ภาพรวมวันนี้สำหรับติดตามงาน, ข้อมูลหลัก และกิจกรรมสำคัญของระบบ
            </Typography.Paragraph>
            <div className={styles.heroMeta}>
              <span className={styles.metaPill}>
                <NotificationOutlined /> โปรโมชั่น:
                ตรวจข้อมูลลูกค้าใหม่ก่อนเปิดรอบขาย
              </span>
              <span className={styles.metaPill}>
                <CalendarOutlined /> ประชุมทีม 10:30
              </span>
            </div>
          </div>
        </section>

        <div className={styles.quickLinks}>
          {/* <Button className={styles.quickButton} icon={<UserOutlined />} onClick={() => router.push("/master/customers")}>
            ลูกค้า
          </Button>
          <Button className={styles.quickButton} icon={<TagsOutlined />} onClick={() => router.push("/master/products")}>
            สินค้า
          </Button> */}
          <Button
            type="primary"
            className={styles.quickButton}
            icon={<AppstoreOutlined />}
            onClick={() => router.push("/main-menu")}
          >
            เมนู ERP ทั้งหมด
          </Button>
        </div>

        <div className={styles.grid}>
          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <Typography.Title level={4}>ปฏิทิน</Typography.Title>
                <Typography.Text type="secondary">
                  {calendar.title}
                </Typography.Text>
              </div>
              <Button icon={<CalendarOutlined />} />
            </div>
            <div className={styles.minimalCalendar}>
              <div className={styles.calendarGrid}>
                {weekdays.map((day) => (
                  <div className={styles.calendarWeekday} key={day}>
                    {day}
                  </div>
                ))}
                {calendar.cells.map((cell, index) => (
                  <div
                    className={`${styles.calendarDay} ${cell.muted ? styles.calendarMuted : ""} ${
                      cell.today ? styles.calendarToday : ""
                    }`}
                    key={`${cell.label}-${index}`}
                  >
                    <span>{cell.label}</span>
                    {cell.hasEvent ? <i /> : null}
                  </div>
                ))}
              </div>
              <div className={styles.calendarLegend}>
                <span><i /> วันที่มีกิจกรรม</span>
                <span className={styles.todayLegend}>วันนี้</span>
              </div>
            </div>
          </section>

          <section className={`${styles.panel} ${styles.weather}`}>
            <div className={styles.panelHeader}>
              <div>
                <Typography.Title level={4}>อากาศวันนี้</Typography.Title>
                <Typography.Text type="secondary">
                  Mockup: กรุงเทพฯ
                </Typography.Text>
              </div>
              <CloudOutlined />
            </div>
            <div className={styles.weatherMain}>
              <div>
                <div className={styles.temperature}>31°C</div>
                <Typography.Text>แดดอ่อน มีเมฆบางส่วน</Typography.Text>
              </div>
              <div className={styles.weatherIcon}>
                <SunOutlined />
              </div>
            </div>
            <div className={styles.weatherStats}>
              <div className={styles.stat}>
                <span>ความชื้น</span>
                <strong>68%</strong>
              </div>
              <div className={styles.stat}>
                <span>ลม</span>
                <strong>9 กม./ชม.</strong>
              </div>
              <div className={styles.stat}>
                <span>ฝน</span>
                <strong>20%</strong>
              </div>
            </div>
          </section>
        </div>
      </Layout.Content>
    </Layout>
  );
}
