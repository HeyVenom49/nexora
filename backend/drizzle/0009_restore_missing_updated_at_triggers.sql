-- Custom SQL migration: restore updated_at triggers that were missing from the
-- database. DROP IF EXISTS + CREATE keeps this safe on databases that already
-- have them (e.g. fresh setups running 0002-0006 in order).
DROP TRIGGER IF EXISTS products_set_updated_at ON products;--> statement-breakpoint
CREATE TRIGGER products_set_updated_at
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();--> statement-breakpoint
DROP TRIGGER IF EXISTS product_variants_set_updated_at ON product_variants;--> statement-breakpoint
CREATE TRIGGER product_variants_set_updated_at
BEFORE UPDATE ON product_variants
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();--> statement-breakpoint
DROP TRIGGER IF EXISTS inventory_set_updated_at ON inventory;--> statement-breakpoint
CREATE TRIGGER inventory_set_updated_at
BEFORE UPDATE ON inventory
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();--> statement-breakpoint
DROP TRIGGER IF EXISTS carts_set_updated_at ON carts;--> statement-breakpoint
CREATE TRIGGER carts_set_updated_at
BEFORE UPDATE ON carts
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();--> statement-breakpoint
DROP TRIGGER IF EXISTS cart_items_set_updated_at ON cart_items;--> statement-breakpoint
CREATE TRIGGER cart_items_set_updated_at
BEFORE UPDATE ON cart_items
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();--> statement-breakpoint
DROP TRIGGER IF EXISTS addresses_set_updated_at ON addresses;--> statement-breakpoint
CREATE TRIGGER addresses_set_updated_at
BEFORE UPDATE ON addresses
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
