import type { Metadata } from "next";
import { PageReadyOverlay } from "@/components/PageReadyOverlay";
import "../styles/globals.scss";

export const metadata: Metadata = {
  title: "ERP Platform",
  description: "ERP management platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const criticalCss = `
    html, body { min-height: 100%; margin: 0; background: #f4f7fa; color: #14212b; font-family: Arial, Helvetica, sans-serif; }
    * { box-sizing: border-box; }
    .erp-login-page { min-height: 100vh; display: grid; grid-template-columns: minmax(320px, 1fr) minmax(360px, 480px); background: #f5f7fb; }
    .erp-login-brand { display: flex; flex-direction: column; justify-content: center; padding: 64px; color: #fff; background: linear-gradient(rgba(8,37,56,.78), rgba(8,37,56,.78)), url("/images/login-official-bg.png"); background-size: cover; background-position: center; }
    .erp-login-panel { display: flex; flex-direction: column; justify-content: center; padding: 56px; background: #fff; }
    .erp-app-shell { min-height: 100vh; background: #f4f7fa; }
    @media (max-width: 860px) { .erp-login-page { grid-template-columns: 1fr; } .erp-login-brand { min-height: 34vh; padding: 40px 24px; } .erp-login-panel { padding: 40px 24px; } }
  `;

  return (
    <html lang="th">
      <head>
        <link rel="preload" href="/images/login-official-bg.png" as="image" />
        <style dangerouslySetInnerHTML={{ __html: criticalCss }} />
      </head>
      <body>
        <PageReadyOverlay />
        {children}
      </body>
    </html>
  );
}
