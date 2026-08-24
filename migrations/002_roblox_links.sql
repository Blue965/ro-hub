-- Migration 002: roblox_links table for proof-code linking

CREATE TABLE IF NOT EXISTS roblox_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  code text NOT NULL,
  username text,
  verified boolean DEFAULT false,
  verified_at timestamptz,
  created_at timestamptz DEFAULT now()
);
