-- Custom SQL migration file, put your code below! --
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = statement_timestamp();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;