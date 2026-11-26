CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_number" varchar(32) NOT NULL,
	"user_id" uuid NOT NULL,
	"status" varchar(30) DEFAULT 'pending_payment' NOT NULL,
	"subtotal_amount" bigint NOT NULL,
	"discount_amount" bigint DEFAULT 0 NOT NULL,
	"shipping_amount" bigint DEFAULT 0 NOT NULL,
	"tax_amount" bigint DEFAULT 0 NOT NULL,
	"total_amount" bigint NOT NULL,
	"currency" varchar(3) DEFAULT 'INR' NOT NULL,
	"shipping_address_snapshot" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "orders_order_number_unique" UNIQUE("order_number"),
	CONSTRAINT "orders_status_valid" CHECK ("orders"."status" IN (
            'pending_payment',
            'confirmed',
            'processing',
            'fulfilled',
            'cancelled'
        )),
	CONSTRAINT "orders_amounts_non_negative" CHECK (
            "orders"."subtotal_amount" >= 0
            AND "orders"."discount_amount" >= 0
            AND "orders"."shipping_amount" >= 0
            AND "orders"."tax_amount" >= 0
            AND "orders"."total_amount" >= 0
        ),
	CONSTRAINT "orders_total_matches_breakdown" CHECK (
            "orders"."total_amount" = "orders"."subtotal_amount" - "orders"."discount_amount" + "orders"."shipping_amount" + "orders"."tax_amount"
        ),
	CONSTRAINT "orders_currency_format" CHECK ("orders"."currency" ~ '^[A-Z]{3}$')
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"variant_id" uuid NOT NULL,
	"product_name" varchar(255) NOT NULL,
	"sku" varchar(100) NOT NULL,
	"attributes_snapshot" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"unit_price_amount" bigint NOT NULL,
	"quantity" integer NOT NULL,
	"line_total_amount" bigint NOT NULL,
	"currency" varchar(3) DEFAULT 'INR' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "order_items_quantity_positive" CHECK ("order_items"."quantity" > 0),
	CONSTRAINT "order_items_unit_price_non_negative" CHECK ("order_items"."unit_price_amount" >= 0),
	CONSTRAINT "order_items_line_total_correct" CHECK (
            "order_items"."line_total_amount" = "order_items"."unit_price_amount" * "order_items"."quantity"
        ),
	CONSTRAINT "order_items_currency_format" CHECK ("order_items"."currency" ~ '^[A-Z]{3}$')
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"provider" varchar(50) NOT NULL,
	"provider_payment_id" varchar(255) NOT NULL,
	"idempotency_key" varchar(255) NOT NULL,
	"amount" bigint NOT NULL,
	"currency" varchar(3) DEFAULT 'INR' NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "payments_provider_idempotency_unique" UNIQUE("provider","idempotency_key"),
	CONSTRAINT "payments_provider_payment_id_unique" UNIQUE("provider","provider_payment_id"),
	CONSTRAINT "payments_amount_positive" CHECK ("payments"."amount" > 0),
	CONSTRAINT "payments_status_valid" CHECK ("payments"."status" IN (
            'pending',
            'succeeded',
            'failed',
            'cancelled',
            'unknown'
        )),
	CONSTRAINT "payments_currency_format" CHECK ("payments"."currency" ~ '^[A-Z]{3}$')
);
--> statement-breakpoint
CREATE TABLE "inventory_reservations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"variant_id" uuid NOT NULL,
	"quantity" integer NOT NULL,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "inventory_reservations_quantity_check" CHECK ("inventory_reservations"."quantity" > 0),
	CONSTRAINT "inventory_reservations_status_check" CHECK ("inventory_reservations"."status" IN ('active', 'committed', 'released', 'expired'))
);
--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_reservations" ADD CONSTRAINT "inventory_reservations_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_reservations" ADD CONSTRAINT "inventory_reservations_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "orders_user_created_idx" ON "orders" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "order_items_order_id_idx" ON "order_items" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "payments_order_id_idx" ON "payments" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "inventory_reservations_order_id_idx" ON "inventory_reservations" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "inventory_reservations_variant_id_idx" ON "inventory_reservations" USING btree ("variant_id");--> statement-breakpoint
CREATE INDEX "inventory_reservations_active_expiry_idx" ON "inventory_reservations" USING btree ("expires_at") WHERE "inventory_reservations"."status" = 'active';