-- Custom SQL migration: attach the shared set_updated_at() trigger to tables
-- that have an updated_at column but no trigger yet.
CREATE TRIGGER orders_set_updated_at
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();--> statement-breakpoint
CREATE TRIGGER order_items_set_updated_at
BEFORE UPDATE ON order_items
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();--> statement-breakpoint
CREATE TRIGGER payments_set_updated_at
BEFORE UPDATE ON payments
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();--> statement-breakpoint
CREATE TRIGGER inventory_reservations_set_updated_at
BEFORE UPDATE ON inventory_reservations
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
