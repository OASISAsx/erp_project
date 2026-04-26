"use client";

import "@ant-design/v5-patch-for-react-19";
import { LockOutlined, MailOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Form, Input, Typography, message } from "antd";
import { signIn } from "next-auth/react";
import Link from "next/link";
import styles from "@/app/login/page.module.scss";

type RegisterForm = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export default function RegisterAntdPanel() {
  const [messageApi, contextHolder] = message.useMessage();

  const onFinish = async (values: RegisterForm) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
    const response = await fetch(`${apiUrl}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: values.name,
        email: values.email,
        password: values.password
      })
    });

    if (!response.ok) {
      const isConflict = response.status === 409;
      messageApi.error(isConflict ? "อีเมลนี้ถูกสมัครไว้แล้ว" : "สมัครสมาชิกไม่สำเร็จ");
      return;
    }

    const signInResult = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false
    });

    if (signInResult?.ok) {
      messageApi.success("สมัครสมาชิกสำเร็จ");
      window.location.assign("/main-menu");
      return;
    }

    messageApi.success("สมัครสมาชิกสำเร็จ กรุณาเข้าสู่ระบบ");
    window.location.assign("/login");
  };

  return (
    <section className={`${styles.loginPanel} erp-login-panel`} aria-label="Register form">
      {contextHolder}
      <Typography.Title level={2}>สมัครสมาชิก</Typography.Title>
      <Typography.Text type="secondary">สร้างบัญชีผู้ใช้งานใหม่สำหรับระบบ ERP</Typography.Text>

      <Form<RegisterForm> layout="vertical" className={styles.form} onFinish={onFinish}>
        <Form.Item
          label="ชื่อผู้ใช้งาน"
          name="name"
          rules={[{ required: true, min: 2, message: "กรุณากรอกชื่ออย่างน้อย 2 ตัวอักษร" }]}
        >
          <Input prefix={<UserOutlined />} size="large" placeholder="ชื่อผู้ใช้งาน" />
        </Form.Item>

        <Form.Item
          label="อีเมล"
          name="email"
          rules={[
            { required: true, message: "กรุณากรอกอีเมล" },
            { type: "email", message: "รูปแบบอีเมลไม่ถูกต้อง" }
          ]}
        >
          <Input prefix={<MailOutlined />} size="large" placeholder="name@company.com" />
        </Form.Item>

        <Form.Item
          label="รหัสผ่าน"
          name="password"
          rules={[{ required: true, min: 6, message: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร" }]}
        >
          <Input.Password prefix={<LockOutlined />} size="large" placeholder="อย่างน้อย 6 ตัวอักษร" />
        </Form.Item>

        <Form.Item
          label="ยืนยันรหัสผ่าน"
          name="confirmPassword"
          dependencies={["password"]}
          rules={[
            { required: true, message: "กรุณายืนยันรหัสผ่าน" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("password") === value) {
                  return Promise.resolve();
                }

                return Promise.reject(new Error("รหัสผ่านไม่ตรงกัน"));
              }
            })
          ]}
        >
          <Input.Password prefix={<LockOutlined />} size="large" placeholder="ยืนยันรหัสผ่าน" />
        </Form.Item>

        <Button type="primary" htmlType="submit" size="large" block>
          สมัครสมาชิก
        </Button>
      </Form>

      <p className={styles.switchAuth}>
        มีบัญชีแล้ว <Link href="/login">เข้าสู่ระบบ</Link>
      </p>
    </section>
  );
}
