ALTER TABLE "products" ADD COLUMN "compare_price" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "colors" text[] DEFAULT '{}'::text[] NOT NULL;