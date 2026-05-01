CREATE TABLE IF NOT EXISTS "main_statuses" (
  "id" TEXT NOT NULL,
  "module" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "description" TEXT,
  "color" TEXT NOT NULL DEFAULT 'blue',
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "main_statuses_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "main_statuses_module_code_key" ON "main_statuses"("module", "code");
CREATE INDEX IF NOT EXISTS "main_statuses_module_is_active_sort_order_idx" ON "main_statuses"("module", "is_active", "sort_order");

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

ALTER TABLE "purchase_orders"
  ADD COLUMN IF NOT EXISTS "main_status_id" TEXT;

UPDATE "purchase_orders" po
SET "main_status_id" = ms."id"
FROM "main_statuses" ms
WHERE ms."module" = 'purchase_orders'
  AND ms."code" = po."status"
  AND po."main_status_id" IS NULL;

UPDATE "purchase_orders" po
SET "status" = 'waiting_picking',
    "main_status_id" = 'purchase_orders_waiting_picking'
WHERE po."status" IN ('draft', 'partial_received')
  AND po."main_status_id" IS NULL;

UPDATE "purchase_orders" po
SET "status" = 'closed',
    "main_status_id" = 'purchase_orders_closed'
WHERE po."status" = 'received'
  AND po."main_status_id" IS NULL;

ALTER TABLE "purchase_orders"
  ADD CONSTRAINT "purchase_orders_main_status_id_fkey"
  FOREIGN KEY ("main_status_id") REFERENCES "main_statuses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "purchase_orders"
  ALTER COLUMN "status" SET DEFAULT 'waiting_picking';
