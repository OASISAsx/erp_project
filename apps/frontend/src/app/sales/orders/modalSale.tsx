import { SalesOrdersPageProps } from "@/types/sales.type";
import { Modal } from "antd";

type OrderViewModalProps = {
  open: boolean;
  order: SalesOrdersPageProps | null;
  onClose: () => void;
};

function OrderViewModal({ open, order, onClose }: OrderViewModalProps) {
  return (
    <Modal
      title="รายละเอียดใบสั่งขาย"
      open={open}
      onCancel={onClose}
      footer={null}
    >
      {order ? (
        <>
          <p>เลขที่เอกสาร: {order.transactionNo}</p>
          <p>ชื่อลูกค้า: {order.customerName}</p>
          <p>วันที่สั่งซื้อ: {order.orderDate}</p>
          <p>สถานะ: {order.status}</p>
        </>
      ) : null}
    </Modal>
  );
}

export default OrderViewModal;
