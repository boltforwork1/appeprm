import { useEffect, useState } from 'react';
import { supabase } from './supabase';

export type Option = { id: string; label: string };
export type ForeignRef = { table: string; labelColumn: string; filter?: { column: string; value: string } };

/**
 * Load label options for multiple foreign-key selects at once (soft-delete aware).
 * Returns a map keyed by the index in the refs array.
 */
export function useForeignOptionsBatch(refs: ForeignRef[]) {
  const [map, setMap] = useState<Record<number, Option[]>>({});
  const [loading, setLoading] = useState(true);

  // stable dependency string
  const key = refs.map((r) => `${r.table}:${r.labelColumn}:${r.filter?.column ?? ''}:${r.filter?.value ?? ''}`).join('|');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all(
      refs.map(async (r) => {
        let q = supabase.from(r.table).select(`id, ${r.labelColumn}`).eq('is_deleted', false);
        if (r.filter) q = q.eq(r.filter.column, r.filter.value);
        const { data, error } = await q.order(r.labelColumn, { ascending: true });
        if (error) {
          console.error(`[useForeignOptionsBatch:${r.table}]`, error);
          return [];
        }
        return (data ?? []).map((row) => ({ id: row.id as string, label: String(row[r.labelColumn] ?? '') }));
      })
    ).then((results) => {
      if (!mounted) return;
      const next: Record<number, Option[]> = {};
      results.forEach((opts, i) => (next[i] = opts));
      setMap(next);
      setLoading(false);
    });
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return { map, loading };
}
