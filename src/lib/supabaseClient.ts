const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    "Missing Supabase env vars. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.",
  );
}

const baseHeaders = {
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  "Content-Type": "application/json",
};

// Insert one or more rows into a table
export async function supabaseInsert<T extends object>(
  table: string,
  row: T,
): Promise<void> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: "POST",
    headers: { ...baseHeaders, Prefer: "return=minimal" },
    body: JSON.stringify(row),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase insert failed (${res.status}): ${text}`);
  }
}

// Select rows from a table, ordered by a column, limited to `limit` rows
export async function supabaseSelect<T>(
  table: string,
  options: {
    columns?: string;
    orderBy?: string;
    ascending?: boolean;
    limit?: number;
  } = {},
): Promise<T[]> {
  const { columns = "*", orderBy, ascending = false, limit } = options;
  const params = new URLSearchParams();
  params.set("select", columns);
  if (orderBy) params.set("order", `${orderBy}.${ascending ? "asc" : "desc"}`);
  if (limit) params.set("limit", String(limit));

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/${table}?${params.toString()}`,
    {
      headers: baseHeaders,
    },
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase select failed (${res.status}): ${text}`);
  }
  return res.json();
}
