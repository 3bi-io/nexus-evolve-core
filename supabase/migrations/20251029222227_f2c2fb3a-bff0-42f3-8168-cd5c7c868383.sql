-- Enable pgcrypto extension for IP encryption
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create function to encrypt IP addresses
CREATE OR REPLACE FUNCTION encrypt_ip(ip_address TEXT, encryption_key TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN encode(pgp_sym_encrypt(ip_address, encryption_key), 'base64');
END;
$$;

-- Grant execute permission to authenticated and anon users
GRANT EXECUTE ON FUNCTION encrypt_ip(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION encrypt_ip(TEXT, TEXT) TO anon;