import { EmptyState } from "@/components/empty-state";

export function DatabaseUnavailable() {
  return (
    <EmptyState>
      This site cannot read the society database yet. Set SUPABASE_URL and
      SUPABASE_PUBLISHABLE_KEY on the server.
    </EmptyState>
  );
}
