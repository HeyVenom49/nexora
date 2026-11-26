CREATE TABLE "inventory" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"variant_id" uuid NOT NULL,
	"total_quantity" integer DEFAULT 0 NOT NULL,
	"reserved_quantity" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "inventory_variant_unique" UNIQUE("variant_id"),
	CONSTRAINT "inventory_total_non_negative" CHECK ("inventory"."total_quantity" >= 0),
	CONSTRAINT "inventory_reserved_non_negative" CHECK ("inventory"."reserved_quantity" >= 0),
	CONSTRAINT "inventory_reserved_not_exceed_total" CHECK ("inventory"."reserved_quantity" <= "inventory"."total_quantity")
);
--> statement-breakpoint
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE restrict ON UPDATE no action;

CREATE TRIGGER inventory_set_updated_at
BEFORE UPDATE ON inventory
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();