import { AntdRegistry } from "@ant-design/nextjs-registry";
import { AuthSessionProvider } from "@/components/AuthSessionProvider";

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <AntdRegistry>
      <AuthSessionProvider>{children}</AuthSessionProvider>
    </AntdRegistry>
  );
}
