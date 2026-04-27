import "@ant-design/v5-patch-for-react-19";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { AuthSessionProvider } from "@/components/AuthSessionProvider";

export default function MasterLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AntdRegistry>
      <AuthSessionProvider>{children}</AuthSessionProvider>
    </AntdRegistry>
  );
}
