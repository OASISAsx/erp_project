"use client";

import "@ant-design/v5-patch-for-react-19";
import { LockOutlined, MailOutlined } from "@ant-design/icons";
import { Button, Form, Input, Typography, message } from "antd";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import styles from "@/app/login/page.module.scss";

type LoginForm = {
  email: string;
  password: string;
};

export default function LoginAntdPanel() {
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm<LoginForm>();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: LoginForm) => {
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        ...values,
        redirect: false
      });

      if (result?.error) {
        messageApi.error("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
        return;
      }

      window.location.href = "/dashboard";
    } catch {
      messageApi.error("เข้าสู่ระบบไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={`${styles.loginPanel} erp-login-panel`} aria-label="Login form">
      {contextHolder}
      <Typography.Title level={2}>เข้าสู่ระบบ</Typography.Title>
      <Typography.Text type="secondary">ใช้บัญชีผู้ดูแลระบบเพื่อเริ่มต้น</Typography.Text>

      <Form<LoginForm>
        form={form}
        layout="vertical"
        className={styles.form}
        initialValues={{ email: "admin@erp.local", password: "admin123" }}
        onFinish={onFinish}
      >
        <Form.Item
          label="อีเมล"
          name="email"
          rules={[
            { required: true, message: "กรุณากรอกอีเมล" },
            { type: "email", message: "รูปแบบอีเมลไม่ถูกต้อง" }
          ]}
        >
          <Input prefix={<MailOutlined />} size="large" placeholder="admin@erp.local" />
        </Form.Item>

        <Form.Item label="รหัสผ่าน" name="password" rules={[{ required: true, message: "กรุณากรอกรหัสผ่าน" }]}>
          <Input.Password prefix={<LockOutlined />} size="large" placeholder="admin123" />
        </Form.Item>

        <Button type="primary" htmlType="submit" size="large" block loading={loading}>
          เข้าสู่ระบบ
        </Button>
      </Form>

      <p className={styles.switchAuth}>
        ยังไม่มีบัญชี <Link href="/register">สมัครสมาชิก</Link>
      </p>
    </section>
  );
}
