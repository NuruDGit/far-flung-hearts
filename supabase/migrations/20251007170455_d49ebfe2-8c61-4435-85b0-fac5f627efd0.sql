-- Migration: Move vector extension to extensions schema for security
-- Priority: P0 - CRITICAL security fix
-- Safe because embeddings table has 0 rows

-- Step 1: Create extensions schema (if not exists)
CREATE SCHEMA IF NOT EXISTS extensions;

-- Step 2: Grant permissions BEFORE moving extension
GRANT USAGE ON SCHEMA extensions TO authenticated;
GRANT USAGE ON SCHEMA extensions TO service_role;
GRANT USAGE ON SCHEMA extensions TO anon;

-- Step 3: Drop the index that depends on vector type
DROP INDEX IF EXISTS public.embeddings_embedding_idx;

-- Step 4: Drop the embedding column (safe - table is empty)
ALTER TABLE public.embeddings DROP COLUMN IF EXISTS embedding;

-- Step 5: Drop and recreate vector extension in extensions schema
DROP EXTENSION IF EXISTS vector CASCADE;
CREATE EXTENSION vector WITH SCHEMA extensions;

-- Step 6: Add embedding column back with extensions.vector type
ALTER TABLE public.embeddings 
  ADD COLUMN embedding extensions.vector(1536);

-- Step 7: Recreate the ivfflat index with proper schema reference
CREATE INDEX embeddings_embedding_idx 
ON public.embeddings 
USING ivfflat (embedding extensions.vector_cosine_ops) 
WITH (lists = 100);

-- Step 8: Grant permissions on extension schema
GRANT ALL ON ALL TABLES IN SCHEMA extensions TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA extensions TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA extensions TO authenticated;