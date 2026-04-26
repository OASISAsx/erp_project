import "@ant-design/v5-patch-for-react-19";
import { AntdRegistry } from "@ant-design/nextjs-registry";

export default function MainMenuLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AntdRegistry>{children}</AntdRegistry>;
}
