import { supabase } from "@/lib/supabase";

type ConnectionResult =
  | { status: "success" }
  | { status: "error"; message: string };

function formatSupabaseError(error: {
  message: string;
  code?: string;
  details?: string;
  hint?: string;
}): string {
  const lines = [`Message: ${error.message}`];

  if (error.code) lines.push(`Code: ${error.code}`);
  if (error.details) lines.push(`Details: ${error.details}`);
  if (error.hint) lines.push(`Hint: ${error.hint}`);

  return lines.join("\n");
}

async function testConnection(): Promise<ConnectionResult> {
  const { error } = await supabase
    .from("restaurants")
    .select("id", { count: "exact", head: true });

  if (!error) {
    return { status: "success" };
  }

  // PostgREST responded but the table is not set up yet — connection still works.
  if (error.code === "PGRST205") {
    return { status: "success" };
  }

  return { status: "error", message: formatSupabaseError(error) };
}

export default async function TestDbPage() {
  let result: ConnectionResult;

  try {
    result = await testConnection();
  } catch (err) {
    result = {
      status: "error",
      message:
        err instanceof Error ? err.message : "An unexpected error occurred.",
    };
  }

  return (
    <main className="flex min-h-full flex-1 items-center justify-center bg-zinc-50 px-6 py-16 dark:bg-black">
      <div className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Supabase Connection Test
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Route: <code className="font-mono">/test-db</code>
        </p>

        <div className="mt-8">
          {result.status === "success" ? (
            <p className="text-lg font-medium text-green-600 dark:text-green-400">
              Connected Successfully
            </p>
          ) : (
            <div>
              <p className="text-lg font-medium text-red-600 dark:text-red-400">
                Connection Failed
              </p>
              <pre className="mt-4 overflow-x-auto rounded-lg bg-zinc-100 p-4 font-mono text-sm whitespace-pre-wrap text-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
                {result.message}
              </pre>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
