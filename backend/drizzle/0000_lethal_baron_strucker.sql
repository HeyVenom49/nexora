CREATE TABLE "users" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid () NOT NULL,
    "email" varchar(255) NOT NULL,
    "password_hash" text NOT NULL,
    "created_at" timestamp
    with
        time zone DEFAULT now() NOT NULL,
        "updated_at" timestamp
    with
        time zone DEFAULT now() NOT NULL,
        CONSTRAINT "users_email_unique" UNIQUE ("email")
);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
	NEW.updated_at = CURRENT_TIMESTAMP;
	RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_set_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();