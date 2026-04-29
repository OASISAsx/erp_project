import { AntdRegistry } from "@ant-design/nextjs-registry";
import { AuthSessionProvider } from "@/components/AuthSessionProvider";

export default function PurchaseLayout({
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
