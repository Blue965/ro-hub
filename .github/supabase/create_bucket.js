/* create_bucket.js - creates a bucket named "projects" if it doesn't exist */

const { createClient } = require("@supabase/supabase-js");

const projectRef = process.env.SUPABASE_PROJECT_REF;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!projectRef || !serviceKey) {
  console.error("Missing SUPABASE_PROJECT_REF or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const url = `https://${projectRef}.supabase.co`;
const supabase = createClient(url, serviceKey);

async function ensureBucket() {
  const bucket = "projects";
  try {
    const { data: existing, error: listErr } = await supabase.storage.listBuckets();
    if (listErr) throw listErr;
    const found = (existing || []).find(b => b.name === bucket);
    if (found) {
      console.log(`Bucket '${bucket}' already exists`);
      return;
    }

    const { data, error } = await supabase.storage.createBucket(bucket, { public: false });
    if (error) {
      console.error("Error creating bucket:", error.message || error);
      process.exit(1);
    }
    console.log("Bucket created:", data.name);
  } catch (err) {
    console.error("Failed to ensure bucket:", err.message || err);
    process.exit(1);
  }
}

ensureBucket();
