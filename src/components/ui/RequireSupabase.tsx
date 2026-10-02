import type { ReactNode } from 'react'
import { DatabaseZap } from 'lucide-react'
import { isSupabaseConfigured } from '@/lib/supabase'
import { EmptyState } from '@/components/ui/EmptyState'

/** Wraps any page that needs the real database — shows a friendly message instead of crashing until it's connected. */
export function RequireSupabase({ children }: { children: ReactNode }) {
  if (isSupabaseConfigured) return <>{children}</>
  return (
    <div className="container-page py-16">
      <EmptyState
        icon={<DatabaseZap size={26} strokeWidth={1.3} />}
        title="Not connected yet"
        description="This part of ZAYNKAR needs the store's database to be connected. Add your Supabase project URL and key to .env.local, then restart the site."
      />
    </div>
  )
}
