"use client";

import dynamic from "next/dynamic";
import styles from "./page.module.scss";

const LoginAntdPanel = dynamic(() => import("@/components/LoginAntdPanel"), {
  ssr: false,
  loading: () => (
    <section className={`${styles.loginPanel} ${styles.loadingPanel} erp-login-panel`}>
      <div className={styles.loadingBlock}>
        <div className={styles.loadingTitle} />
        <div className={styles.loadingText} />
        <div className={styles.loadingInput} />
        <div className={styles.loadingInput} />
        <div className={styles.loadingButton} />
      </div>
    </section>
  )
});

export default function LoginPage() {
  return (
    <main className={`${styles.loginPage} erp-login-page`}>
      <section className={`${styles.brandPanel} erp-login-brand`}>
        <div className={styles.brandMark}>ERP</div>
        <h1>ERP Platform</h1>
        <p>ระบบจัดการงานองค์กรสำหรับการขาย คลังสินค้า จัดซื้อ บัญชี และทรัพยากรบุคคล</p>
      </section>

      <LoginAntdPanel />
    </main>
  );
}
