"use client";

import "@ant-design/v5-patch-for-react-19";
import { useEffect, useMemo, useState } from "react";
import {
  CheckCircleOutlined,
  DeleteOutlined,
  InboxOutlined,
  QrcodeOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  Button,
  Form,
  Input,
  Modal,
  Progress,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useSession } from "next-auth/react";
import { MasterSectionShell } from "@/components/MasterSectionShell";
import { useWarehouseReceivingStore } from "@/stores/warehouseReceivingStore";
import type {
  ReceivingOrderItem,
  ReceivingPurchaseOrder,
  ScanTarget,
} from "@/types/warehouse.type";
import shellStyles from "@/app/master/master.module.scss";
import styles from "./page.module.scss";

const statusColor: Record<string, string> = {
  waiting_picking: "gold",
  closed: "green",
};

type ScanForm = {
  warehouseLocation?: string;
  serialDraft?: string;
};

export default function WarehouseReceivingPage() {
  const { data: session, status } = useSession();
  const [messageApi, contextHolder] = message.useMessage();
  const [scanForm] = Form.useForm<ScanForm>();
  const warehouseLocationInput = Form.useWatch("warehouseLocation", scanForm);
  const serialDraft = Form.useWatch("serialDraft", scanForm) ?? "";
  const {
    orders,
    loading,
    saving,
    loadOrders: loadStoreOrders,
    receiveSerials,
  } = useWarehouseReceivingStore();
  const [selectedOrderId, setSelectedOrderId] = useState<string>();
  const [search, setSearch] = useState("");
  const [scanTarget, setScanTarget] = useState<ScanTarget | null>(null);
  const [scannedSerials, setScannedSerials] = useState<string[]>([]);

  const loadOrders = async () => {
    if (status !== "authenticated" || !session?.accessToken) {
      return;
    }

    try {
      await loadStoreOrders(session.accessToken);
      const latestOrders = useWarehouseReceivingStore.getState().orders;
      setSelectedOrderId(
        (current) =>
          current ??
          latestOrders.find((order) => order.status !== "closed")?.id ??
          latestOrders[0]?.id,
      );
    } catch {
      messageApi.error("Load receiving orders failed");
    }
  };

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.accessToken, status]);

  const filteredOrders = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return orders;
    }

    return orders.filter((order) =>
      [order.number, order.customer.name, order.customer.code].some((value) =>
        value.toLowerCase().includes(keyword),
      ),
    );
  }, [orders, search]);

  const selectedOrder = useMemo(
    () =>
      orders.find((order) => order.id === selectedOrderId) ?? filteredOrders[0],
    [filteredOrders, orders, selectedOrderId],
  );

  const orderSummary = useMemo(() => {
    if (!selectedOrder) {
      return { total: 0, received: 0, remaining: 0, percent: 0 };
    }

    const total = selectedOrder.items.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );
    const received = selectedOrder.items.reduce(
      (sum, item) => sum + item.receivedQuantity,
      0,
    );
    const remaining = Math.max(total - received, 0);
    const percent = total ? Math.round((received / total) * 100) : 0;

    return { total, received, remaining, percent };
  }, [selectedOrder]);

  const scannerName =
    session?.user?.name ?? session?.user?.email ?? "Current user";
  const scannedSerialRows = useMemo(
    () =>
      scannedSerials.map((serialNumber, index) => ({
        key: serialNumber,
        index: index + 1,
        serialNumber,
        scannedBy: scannerName,
        warehouseLocation: String(warehouseLocationInput ?? "").trim() || "-",
      })),
    [scannedSerials, scannerName, warehouseLocationInput],
  );
  const isScanOverLimit = Boolean(
    scanTarget && scannedSerialRows.length > scanTarget.item.remainingQuantity,
  );

  const openScan = (
    order: ReceivingPurchaseOrder,
    item: ReceivingOrderItem,
  ) => {
    scanForm.setFieldsValue({ warehouseLocation: "WH-A1", serialDraft: "" });
    setScannedSerials([]);
    setScanTarget({ order, item });
  };

  const pushSerialDraft = () => {
    const serialNumber = serialDraft.trim();

    if (!serialNumber) {
      return;
    }

    if (scannedSerials.includes(serialNumber)) {
      messageApi.warning("SN นี้อยู่ในรายการแล้ว");
      scanForm.setFieldValue("serialDraft", "");
      return;
    }

    if (
      scanTarget &&
      scannedSerials.length >= scanTarget.item.remainingQuantity
    ) {
      messageApi.warning(
        `รับได้อีก ${scanTarget.item.remainingQuantity} SN เท่านั้น`,
      );
      return;
    }

    setScannedSerials((current) => [...current, serialNumber]);
    scanForm.setFieldValue("serialDraft", "");
  };

  const submitSerials = async () => {
    if (!session?.accessToken || !scanTarget) {
      return;
    }

    const values = await scanForm.validateFields();
    const serialNumbers = scannedSerials;

    if (!serialNumbers.length) {
      messageApi.warning("กรอก SN อย่างน้อย 1 รายการ");
      return;
    }

    if (serialNumbers.length > scanTarget.item.remainingQuantity) {
      messageApi.warning(
        `รับได้อีก ${scanTarget.item.remainingQuantity} SN เท่านั้น`,
      );
      return;
    }
    try {
      const received = await receiveSerials(
        {
          orderId: scanTarget.order.id,
          purchaseOrderItemId: scanTarget.item.id,
          serialNumbers,
          warehouseLocation: values.warehouseLocation,
        },
        session.accessToken,
      );

      messageApi.success(`Received ${serialNumbers.length} SN`);
      setScanTarget(null);
      scanForm.resetFields();
      setScannedSerials([]);
      if (received) {
        setSelectedOrderId(received.id);
      }
    } catch {
      messageApi.error("Receive SN failed");
    }
  };

  const closeScanModal = () => {
    setScanTarget(null);
    scanForm.resetFields();
    setScannedSerials([]);
  };

  const orderColumns: ColumnsType<ReceivingPurchaseOrder> = [
    {
      title: "ใบงาน",
      render: (_, order) => (
        <button
          className={styles.orderButton}
          type="button"
          onClick={() => setSelectedOrderId(order.id)}
        >
          <span>{order.number}</span>
          <small>{order.customer.name}</small>
        </button>
      ),
    },
    {
      title: "สถานะ",
      dataIndex: "status",
      width: 120,
      render: (value, order) => (
        <Tag color={order.mainStatus?.color ?? statusColor[value] ?? "default"}>
          {order.mainStatus?.label ?? value}
        </Tag>
      ),
    },
  ];

  const itemColumns: ColumnsType<ReceivingOrderItem> = [
    {
      title: "สินค้า",
      render: (_, item) => (
        <div className={styles.productCell}>
          <strong>{item.product.sku}</strong>
          <span>{item.product.name}</span>
        </div>
      ),
    },
    { title: "จำนวน PO", dataIndex: "quantity", align: "right", width: 110 },
    {
      title: "รับแล้ว",
      dataIndex: "receivedQuantity",
      align: "right",
      width: 110,
    },
    {
      title: "ค้างรับ",
      dataIndex: "remainingQuantity",
      align: "right",
      width: 110,
      render: (value) => (
        <Tag color={value > 0 ? "gold" : "green"}>{value}</Tag>
      ),
    },
    {
      title: "SN ล่าสุด",
      width: 220,
      render: (_, item) =>
        item.serials
          .slice(-2)
          .map((serial) => <Tag key={serial.id}>{serial.serialNumber}</Tag>),
    },
    {
      title: "",
      align: "right",
      width: 150,
      render: (_, item) => (
        <Button
          type="primary"
          icon={<QrcodeOutlined />}
          disabled={!selectedOrder || item.remainingQuantity <= 0}
          onClick={() => selectedOrder && openScan(selectedOrder, item)}
        >
          สแกน SN
        </Button>
      ),
    },
  ];

  const scannedSerialColumns: ColumnsType<(typeof scannedSerialRows)[number]> =
    [
      { title: "#", dataIndex: "index", width: 56 },
      { title: "Serial Number", dataIndex: "serialNumber" },
      { title: "User ที่สแกน", dataIndex: "scannedBy", width: 180 },
      { title: "ตำแหน่งคลัง", dataIndex: "warehouseLocation", width: 140 },
    ];

  const scannedSerialTableColumns: ColumnsType<
    (typeof scannedSerialRows)[number]
  > = [
    { title: "#", dataIndex: "index", width: 56 },
    { title: "Serial Number", dataIndex: "serialNumber" },
    { title: "Scanned by", dataIndex: "scannedBy", width: 180 },
    { title: "Location", dataIndex: "warehouseLocation", width: 140 },
    {
      title: "",
      align: "right",
      width: 70,
      render: (_, record) => (
        <Button
          danger
          size="small"
          icon={<DeleteOutlined />}
          onClick={() =>
            setScannedSerials((current) =>
              current.filter((serial) => serial !== record.serialNumber),
            )
          }
        />
      ),
    },
  ];

  return (
    <MasterSectionShell mainMenuKey="warehouse">
      {contextHolder}
      <div className={styles.header}>
        <div>
          <Typography.Title level={3}>รับสินค้าเข้าคลัง</Typography.Title>
          <Typography.Text type="secondary">
            เลือกใบงาน PO แล้วสแกน SN แยกตามสินค้าเพื่อบันทึกเข้าคลัง
          </Typography.Text>
        </div>
        <Button
          icon={<ReloadOutlined />}
          onClick={loadOrders}
          loading={loading}
        >
          โหลดใหม่
        </Button>
      </div>

      <div className={styles.workspace}>
        <section className={shellStyles.panel}>
          <div className={styles.panelTitle}>
            <Space>
              <InboxOutlined />
              <Typography.Text strong>ใบงานจาก PO</Typography.Text>
            </Space>
            <Input
              allowClear
              prefix={<SearchOutlined />}
              placeholder="ค้นหาเลข PO หรือลูกค้า"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <Table
            rowKey="id"
            size="small"
            columns={orderColumns}
            dataSource={filteredOrders}
            loading={loading}
            pagination={{ pageSize: 8 }}
            rowClassName={(order) =>
              order.id === selectedOrder?.id ? styles.selectedRow : ""
            }
          />
        </section>

        <section className={shellStyles.panel}>
          {selectedOrder ? (
            <>
              <div className={styles.detailHeader}>
                <div>
                  <Typography.Text type="secondary">
                    ใบงานรับสินค้า
                  </Typography.Text>
                  <Typography.Title level={4}>
                    {selectedOrder.number}
                  </Typography.Title>
                  <Typography.Text>
                    {selectedOrder.customer.code} -{" "}
                    {selectedOrder.customer.name}
                  </Typography.Text>
                </div>
                <div className={styles.progressBox}>
                  <Progress
                    type="circle"
                    percent={orderSummary.percent}
                    size={96}
                    strokeWidth={12}
                    strokeLinecap="round"
                    strokeColor={
                      orderSummary.percent >= 100 ? "#1f9d55" : "#1677ff"
                    }
                    trailColor="#dbe7f3"
                    status={orderSummary.percent >= 100 ? "success" : "active"}
                  />
                  <div>
                    <strong>
                      {orderSummary.received}/{orderSummary.total}
                    </strong>
                    <span>รับแล้ว เหลือ {orderSummary.remaining}</span>
                  </div>
                </div>
              </div>

              <Table
                rowKey="id"
                columns={itemColumns}
                dataSource={selectedOrder.items}
                pagination={false}
              />
            </>
          ) : (
            <div className={styles.emptyState}>
              <InboxOutlined />
              <Typography.Text>ยังไม่มีใบงานรับสินค้า</Typography.Text>
            </div>
          )}
        </section>
      </div>

      <Modal
        title="สแกน Serial Number"
        open={Boolean(scanTarget)}
        width={860}
        okText="รับเข้าคลัง"
        cancelText="ยกเลิก"
        confirmLoading={saving}
        okButtonProps={{
          disabled: !scannedSerialRows.length || isScanOverLimit,
        }}
        onCancel={closeScanModal}
        onOk={submitSerials}
      >
        {scanTarget ? (
          <div className={styles.scanSummary}>
            <CheckCircleOutlined />
            <div>
              <strong>
                {scanTarget.item.product.sku} - {scanTarget.item.product.name}
              </strong>
              <span>
                ค้างรับ {scanTarget.item.remainingQuantity} จาก{" "}
                {scanTarget.item.quantity} ชิ้น
              </span>
            </div>
          </div>
        ) : null}
        <Form form={scanForm} layout="vertical">
          <Form.Item name="warehouseLocation" label="ตำแหน่งคลัง">
            <Input placeholder="เช่น WH-A1" />
          </Form.Item>
          <Form.Item name="serialDraft" label="Serial Number">
            <Input
              autoFocus
              placeholder="Scan or type SN, then press Enter"
              onPressEnter={(event) => {
                event.preventDefault();
                pushSerialDraft();
              }}
            />
          </Form.Item>
        </Form>
        <div className={styles.scanPreviewHeader}>
          <Typography.Text strong>รายการที่สแกนก่อนบันทึก</Typography.Text>
          <Space>
            <Tag color={isScanOverLimit ? "red" : "blue"}>
              {scannedSerialRows.length} SN
            </Tag>
            {scanTarget ? (
              <Tag color="gold">
                ค้างรับ {scanTarget.item.remainingQuantity}
              </Tag>
            ) : null}
          </Space>
        </div>
        {isScanOverLimit ? (
          <Typography.Text className={styles.scanWarning} type="danger">
            จำนวน SN ที่สแกนมากกว่าจำนวนค้างรับ กรุณาลบรายการส่วนเกินก่อนบันทึก
          </Typography.Text>
        ) : null}
        <Table
          rowKey="key"
          size="small"
          columns={scannedSerialTableColumns}
          dataSource={scannedSerialRows}
          pagination={{ pageSize: 6, hideOnSinglePage: true }}
          locale={{ emptyText: "ยังไม่มี SN ที่สแกน" }}
        />
      </Modal>
    </MasterSectionShell>
  );
}
