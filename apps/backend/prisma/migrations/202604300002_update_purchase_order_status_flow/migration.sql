INSERT INTO "main_statuses" ("id", "module", "code", "label", "description", "color", "sort_order", "is_active", "updated_at")
VALUES
  ('purchase_orders_waiting_picking', 'purchase_orders', 'waiting_picking', 'รอจัดของ', 'Purchase order is waiting for warehouse picking and scanning.', 'gold', 10, true, CURRENT_TIMESTAMP),
  ('purchase_orders_closed', 'purchase_orders', 'closed', 'ปิดงาน', 'Purchase order is closed after warehouse scan is complete.', 'green', 20, true, CURRENT_TIMESTAMP)
ON CONFLICT ("module", "code") DO UPDATE SET
  "label" = EXCLUDED."label",
  "description" = EXCLUDED."description",
  "color" = EXCLUDED."color",
  "sort_order" = EXCLUDED."sort_order",
  "is_active" = EXCLUDED."is_active",
  "updated_at" = CURRENT_TIMESTAMP;

UPDATE "main_statuses"
SET "is_active" = false,
    "updated_at" = CURRENT_TIMESTAMP
WHERE "module" = 'purchase_orders'
  AND "code" IN ('draft', 'partial_received', 'received');

UPDATE "purchase_orders"
SET "status" = 'waiting_picking',
    "main_status_id" = 'purchase_orders_waiting_picking'
WHERE "status" IN ('draft', 'partial_received');

UPDATE "purchase_orders"
SET "status" = 'closed',
    "main_status_id" = 'purchase_orders_closed'
WHERE "status" = 'received';

UPDATE "purchase_orders"
SET "main_status_id" = 'purchase_orders_waiting_picking'
WHERE "status" = 'waiting_picking'
  AND "main_status_id" IS NULL;

UPDATE "purchase_orders"
SET "main_status_id" = 'purchase_orders_closed'
WHERE "status" = 'closed'
  AND "main_status_id" IS NULL;

ALTER TABLE "purchase_orders"
  ALTER COLUMN "status" SET DEFAULT 'waiting_picking';
