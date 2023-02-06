import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "https://lmrcrhulopahgxxwznrs.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtcmNyaHVsb3BhaGd4eHd6bnJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzU2ODI2NzYsImV4cCI6MTk5MTI1ODY3Nn0.qH9IrULJLqoGpB1LBzRY8XTfYTJKj6SAhwLS3Aw99Gw"
);
