-- Speed up /launch/[slug] lookups. Safe if slug is unique per PH product.
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS product_hunt_posts_slug_idx
  ON product_hunt_posts (slug);
