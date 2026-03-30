// lib/watermelon/models/PracticeMatch.ts
import { Model } from '@nozbe/watermelondb';
import { field } from '@nozbe/watermelondb/decorators';

export class PracticeMatch extends Model {
  static table = 'practice_matches';

  @field('season_id') seasonId!: string;
  @field('timestamp') timestamp!: number;
  @field('duration_seconds') durationSeconds!: number;
  @field('all_scores') allScoresRaw!: string;     // JSON string
  @field('total_score') totalScore!: number;
  @field('auto_score') autoScore!: number;
  @field('teleop_score') teleopScore!: number;
  @field('notes') notes!: string;
  @field('tags') tagsRaw!: string;                // JSON string
  @field('synced') synced!: boolean;
  @field('match_number') matchNumber!: number | null;
  @field('alliance') alliance!: string | null;
  @field('match_type') matchType!: string | null;

  get allScores() {
    try { return JSON.parse(this.allScoresRaw); } catch { return {}; }
  }

  get tags(): string[] {
    try { return JSON.parse(this.tagsRaw); } catch { return []; }
  }
}
