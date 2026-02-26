-- Phase 2 Migration Script
-- Run this manually to apply schema changes for Phase 2

-- Rename deposit_amount to initial_fee_amount in leases table
ALTER TABLE leases RENAME COLUMN deposit_amount TO initial_fee_amount;

-- Add new columns to properties table (if not exists)
DO $$
BEGIN
  -- Add publisherRole column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='properties' AND column_name='publisher_role') THEN
    ALTER TABLE properties ADD COLUMN publisher_role VARCHAR DEFAULT 'owner' NOT NULL;
  END IF;

  -- Add status column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='properties' AND column_name='status') THEN
    ALTER TABLE properties ADD COLUMN status VARCHAR DEFAULT 'draft' NOT NULL;
  END IF;

  -- Add rejectionReason column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='properties' AND column_name='rejection_reason') THEN
    ALTER TABLE properties ADD COLUMN rejection_reason TEXT;
  END IF;

  -- Add isNegotiable column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='properties' AND column_name='is_negotiable') THEN
    ALTER TABLE properties ADD COLUMN is_negotiable BOOLEAN DEFAULT false NOT NULL;
  END IF;

  -- Add minPrice column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='properties' AND column_name='min_price') THEN
    ALTER TABLE properties ADD COLUMN min_price DECIMAL(12,2);
  END IF;

  -- Add isHorizontalProperty column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='properties' AND column_name='is_horizontal_property') THEN
    ALTER TABLE properties ADD COLUMN is_horizontal_property BOOLEAN DEFAULT false NOT NULL;
  END IF;

  -- Add contractType column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='properties' AND column_name='contract_type') THEN
    ALTER TABLE properties ADD COLUMN contract_type VARCHAR DEFAULT 'vivienda_urbana' NOT NULL;
  END IF;
END $$;

-- Update existing properties to approved status so they remain visible
UPDATE properties SET status = 'approved' WHERE status = 'draft';

-- Add new columns to property_images table (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='property_images' AND column_name='media_type') THEN
    ALTER TABLE property_images ADD COLUMN media_type VARCHAR DEFAULT 'image' NOT NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='property_images' AND column_name='mime_type') THEN
    ALTER TABLE property_images ADD COLUMN mime_type VARCHAR;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='property_images' AND column_name='size_bytes') THEN
    ALTER TABLE property_images ADD COLUMN size_bytes INTEGER;
  END IF;
END $$;

-- Add proposedRent column to leases table (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leases' AND column_name='proposed_rent') THEN
    ALTER TABLE leases ADD COLUMN proposed_rent DECIMAL(12,2);
  END IF;
END $$;

-- Create property_documents table if not exists
CREATE TABLE IF NOT EXISTS property_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  document_type VARCHAR NOT NULL,
  url VARCHAR(500) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  size_bytes INTEGER,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create user_documents table if not exists
CREATE TABLE IF NOT EXISTS user_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  document_type VARCHAR NOT NULL,
  url VARCHAR(500) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  size_bytes INTEGER,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_property_documents_property_id ON property_documents(property_id);
CREATE INDEX IF NOT EXISTS idx_user_documents_user_id ON user_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
