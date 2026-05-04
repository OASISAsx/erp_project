export type SalesOrdersPageProps = {
  id: number;
  transactionNo: string;
  customerName: string;
  orderDate: string;
  status: "draft" | "confirmed" | "shipped" | "delivered";
};
