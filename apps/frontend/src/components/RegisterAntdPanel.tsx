"use client";

import "@ant-design/v5-patch-for-react-19";
import { LockOutlined, MailOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Form, Input, Typography, message } from "antd";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import styles from "@/app/login/page.module.scss";

type RegisterForm = {
  name: string;
  email: string;
  password: string;
};

export default function RegisterAntdPanel() {
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm<RegisterForm>();
  const [loading, setLoading] = useState(false);
  const register = useAuthStore((state) => state.register);

  const onFinish = async (values: RegisterForm) => {
    setLoading(true);

    try {
      await register(values);
      const result = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false
      });

      if (result?.error) {
        messageApi.error("สมัครสำเร็จ แต่เข้าสู่ระบบไม่สำเร็จ");
        return;
      }

      window.location.href = "/dashboard";
    } catch {
      messageApi.error("สมัครสมาชิกไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={`${styles.loginPanel} erp-login-panel`} aria-label="Register form">
      {contextHolder}
      <Typography.Title level={2}>สมัครสมาชิก</Typography.Title>
      <Typography.Text type="secondary">สร้างบัญชีผู้ใช้สำหรับระบบ ERP</Typography.Text>

      <Form<RegisterForm> form={form} layout="vertical" className={styles.form} onFinish={onFinish}>
        <Form.Item label="ชื่อ" name="name" rules={[{ required: true, message: "กรุณากรอกชื่อ" }]}>
          <Input prefix={<UserOutlined />} size="large" />
        </Form.Item>

        <Form.Item
          label="อีเมล"
          name="email"
          rules={[
            { required: true, message: "กรุณากรอกอีเมล" },
            { type: "email", message: "รูปแบบอีเมลไม่ถูกต้อง" }
          ]}
        >
          <Input prefix={<MailOutlined />} size="large" />
        </Form.Item>

        <Form.Item
          label="รหัสผ่าน"
          name="password"
          rules={[
            { required: true, message: "กรุณากรอกรหัสผ่าน" },
            { min: 6, message: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร" }
          ]}
        >
          <Input.Password prefix={<LockOutlined />} size="large" />
        </Form.Item>

        <Button type="primary" htmlType="submit" size="large" block loading={loading}>
          สมัครสมาชิก
        </Button>
      </Form>

      <p className={styles.switchAuth}>
        มีบัญชีแล้ว <Link href="/login">เข้าสู่ระบบ</Link>
      </p>
    </section>
  );
}
