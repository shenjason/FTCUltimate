// lib/sync.ts
import { supabase } from './supabase';
import { database } from './watermelon/database';
import { PracticeMatch } from './watermelon/models/PracticeMatch';
import { Q } from '@nozbe/watermelondb';

export interface SyncResult {
  pushed: number;
  errors: string[];
}

/**
 * Push all unsynced local matches to Supabase.
 * Marks records as synced on success.
 */
export async function pushUnsyncedMatches(): Promise<SyncResult> {
  const result: SyncResult = { pushed: 0, errors: [] };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    result.errors.push('Not authenticated — skipping sync');
    return result;
  }

  const collection = database.get<PracticeMatch>('practice_matches');
  const unsynced = await collection.query(Q.where('synced', false)).fetch();

  for (const record of unsynced) {
    try {
      const { error } = await supabase.from('practice_matches').upsert({
        id: record.id,
        user_id: user.id,
        season_id: record.seasonId,
        played_at: new Date(record.timestamp).toISOString(),
        total_score: record.totalScore,
        auto_score: record.autoScore,
        teleop_score: record.teleopScore,
        scores: record.allScores,
        notes: record.notes || null,
        tags: record.tags,
        match_number: record.matchNumber ?? null,
        alliance: record.alliance ?? null,
        match_type: record.matchType ?? null,
        duration_seconds: record.durationSeconds ?? null,
        synced: true,
      });

      if (error) {
        result.errors.push(`Match ${record.id}: ${error.message}`);
        continue;
      }

      // Mark local record as synced
      await database.write(async () => {
        await record.update((r) => {
          r.synced = true;
        });
      });
      result.pushed++;
    } catch (err) {
      result.errors.push(`Match ${record.id}: ${String(err)}`);
    }
  }

  return result;
}

/**
 * Returns count of unsynced local matches.
 */
export async function getUnsyncedCount(): Promise<number> {
  const collection = database.get<PracticeMatch>('practice_matches');
  return collection.query(Q.where('synced', false)).fetchCount();
}
