import { useCallback, useEffect, useState } from 'react';
import { supabase } from './supabase';

export type QueryOptions = {
  search?: string;
  searchColumns?: string[];
  orderBy?: { column: string; ascending?: boolean };
  extraFilter?: { column: string; value: string };
  select?: string;
};

/**
 * Generic list hook for a Supabase table (soft-delete aware: filters is_deleted = false).
 */
export function useList<T extends Record<string, unknown>>(
  table: string,
  options: QueryOptions = {}
) {
  const { search, searchColumns, orderBy, extraFilter, select } = options;
  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    let query = supabase.from(table).select(select ?? '*').eq('is_deleted', false);
    if (extraFilter) query = query.eq(extraFilter.column, extraFilter.value);
    if (search && searchColumns && searchColumns.length > 0) {
      const orParts = searchColumns.map((c) => `${c}.ilike.%${search.trim()}%`);
      query = query.or(orParts.join(','));
    }
    if (orderBy) query = query.order(orderBy.column, { ascending: orderBy.ascending ?? false });
    else query = query.order('created_at', { ascending: false });
    const { data, error: err } = await query;
    if (err) {
      console.error(`[useList:${table}]`, err);
      setError(err.message);
    } else {
      setRows((data ?? []) as T[]);
    }
    setLoading(false);
  }, [table, select, extraFilter, search, searchColumns, orderBy]);

  useEffect(() => {
    void load();
  }, [load]);

  return { rows, loading, error, reload: load };
}

/**
 * Insert a new row (sets is_deleted = false by default at the DB level).
 */
export async function insertRow<T extends Record<string, unknown>>(
  table: string,
  payload: Partial<T>
): Promise<T | null> {
  const { data, error } = await supabase.from(table).insert(payload).select().single();
  if (error) {
    console.error(`[insertRow:${table}]`, error);
    throw error;
  }
  return data as T;
}

/**
 * Update a row by id.
 */
export async function updateRow<T extends Record<string, unknown>>(
  table: string,
  id: string,
  payload: Partial<T>
): Promise<T | null> {
  const { data, error } = await supabase.from(table).update(payload).eq('id', id).select().single();
  if (error) {
    console.error(`[updateRow:${table}]`, error);
    throw error;
  }
  return data as T;
}

/**
 * Soft delete: set is_deleted = true.
 */
export async function softDeleteRow(table: string, id: string): Promise<void> {
  const { error } = await supabase.from(table).update({ is_deleted: true }).eq('id', id);
  if (error) {
    console.error(`[softDeleteRow:${table}]`, error);
    throw error;
  }
}
