CREATE TABLE IF NOT EXISTS "erp_sub_menus" (
  "id" TEXT NOT NULL,
  "menu_id" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "path" TEXT NOT NULL,
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "erp_sub_menus_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "erp_sub_menus_key_key" ON "erp_sub_menus"("key");

ALTER TABLE "erp_sub_menus"
  ADD CONSTRAINT "erp_sub_menus_menu_id_fkey"
  FOREIGN KEY ("menu_id") REFERENCES "erp_menus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "department_sub_menu_permissions" (
  "id" TEXT NOT NULL,
  "department_id" TEXT NOT NULL,
  "sub_menu_id" TEXT NOT NULL,
  "can_view" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "department_sub_menu_permissions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "department_sub_menu_permissions_department_id_sub_menu_id_key"
  ON "department_sub_menu_permissions"("department_id", "sub_menu_id");

ALTER TABLE "department_sub_menu_permissions"
  ADD CONSTRAINT "department_sub_menu_permissions_department_id_fkey"
  FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "department_sub_menu_permissions"
  ADD CONSTRAINT "department_sub_menu_permissions_sub_menu_id_fkey"
  FOREIGN KEY ("sub_menu_id") REFERENCES "erp_sub_menus"("id") ON DELETE CASCADE ON UPDATE CASCADE;
