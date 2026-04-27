CREATE TABLE IF NOT EXISTS "customers" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT,
  "phone" TEXT,
  "address" TEXT,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "customers_code_key" ON "customers"("code");

CREATE TABLE IF NOT EXISTS "products" (
  "id" TEXT NOT NULL,
  "sku" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "unit" TEXT NOT NULL DEFAULT 'ชิ้น',
  "price" DECIMAL(12, 2) NOT NULL DEFAULT 0,
  "stock" INTEGER NOT NULL DEFAULT 0,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "products_sku_key" ON "products"("sku");
