"use client";

import dynamic from "next/dynamic";
import styles from "../login/page.module.scss";

const RegisterAntdPanel = dynamic(() => import("@/components/RegisterAntdPanel"), {
  ssr: false,
  loading: () => (
    <section className={`${styles.loginPanel} ${styles.loadingPanel} erp-login-panel`}>
      <div className={styles.loadingBlock}>
        <div className={styles.loadingTitle} />
        <div className={styles.loadingText} />
        <div className={styles.loadingInput} />
        <div className={styles.loadingInput} />
        <div className={styles.loadingInput} />
        <div className={styles.loadingButton} />
      </div>
    </section>
  )
});

export default function RegisterPage() {
  return (
    <main className={`${styles.loginPage} erp-login-page`}>
      <section className={`${styles.brandPanel} erp-login-brand`}>
        <div className={styles.brandMark}>ERP</div>
        <h1>ERP Platform</h1>
        <p>สร้างบัญชีผู้ใช้งานเพื่อเริ่มต้นจัดการงานขาย คลังสินค้า จัดซื้อ บัญชี และทีมงานในระบบเดียว</p>
      </section>

      <RegisterAntdPanel />
    </main>
  );
}
