CREATE TABLE "addresses" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid () NOT NULL,
    "user_id" uuid NOT NULL,
    "label" varchar(50) NOT NULL,
    "recipient_name" varchar(150) NOT NULL,
    "phone" varchar(20) NOT NULL,
    "address_line_1" varchar(255) NOT NULL,
    "address_line_2" varchar(255),
    "city" varchar(100) NOT NULL,
    "state" varchar(100) NOT NULL,
    "postal_code" varchar(20) NOT NULL,
    "country" varchar(2) DEFAULT 'IN' NOT NULL,
    "is_default" boolean DEFAULT false NOT NULL,
    "created_at" timestamp
    with
        time zone DEFAULT now() NOT NULL,
        "updated_at" timestamp
    with
        time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "addresses_user_id_idx" ON "addresses" USING btree ("user_id");

CREATE TRIGGER addresses_set_updated_at
BEFORE UPDATE ON addresses
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();