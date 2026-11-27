-- Correct capitalization of two permission descriptions seeded in 0013.
-- Already-applied databases keep the old text, so fix them with an UPDATE.
UPDATE permissions
SET description = 'Update products'
WHERE key = 'product:update';--> statement-breakpoint
UPDATE permissions
SET description = 'Archive products'
WHERE key = 'product:archive';
