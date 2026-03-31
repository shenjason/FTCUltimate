// app/(tabs)/match/index.tsx
import React, { useState, useEffect } from 'react';
import { Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
const ScreenOrientation = Platform.OS !== "web"
  ? require("expo-screen-orientation")
  : null;
import * as Haptics from 'expo-haptics';
import { useSeasonStore, useMatchStore, useHistoryStore } from '../../../lib/store';
import { computeScore } from '../../../lib/scoreEngine';
import { getSeasonById } from '../../../lib/seasonLoader';
import { MatchSetup } from '../../../components/match/MatchSetup';
import { TimerOnlyMatch } from '../../../components/match/TimerOnlyMatch';
import { LandscapeMatch } from '../../../components/match/LandscapeMatch';
import type { ScoreMap, MatchType } from '../../../types/match';

type ScreenState = 'setup' | 'active';

export default function MatchScreen() {
  const { selectedSeasonId } = useSeasonStore();
  const { matchType, setMatchType, setMatchStarted, resetMatch } = useMatchStore();
  const { saveMatch } = useHistoryStore();

  const [screenState, setScreenState] = useState<ScreenState>('setup');
  const [matchNumber, setMatchNumber] = useState<number | undefined>();
  const [alliance, setAlliance] = useState<'red' | 'blue' | undefined>();

  const season = getSeasonById(selectedSeasonId);

  // Lock to portrait on initial mount (setup state)
  useEffect(() => {
    ScreenOrientation?.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP)?.catch(() => {});
  }, []);

  const handleStart = async (
    type: MatchType,
    number: number | undefined,
    selectedAlliance: 'red' | 'blue',
  ) => {
    setMatchType(type);
    setMatchNumber(number);
    setAlliance(type === 'full' ? undefined : selectedAlliance);
    setMatchStarted(true);

    if (type === 'solo' || type === 'full') {
      await ScreenOrientation?.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE)?.catch(() => {});
    } else {
      // timer_only stays portrait
      await ScreenOrientation?.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP)?.catch(() => {});
    }

    setScreenState('active');
  };

  const handleExit = async () => {
    await ScreenOrientation?.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP)?.catch(() => {});
    resetMatch();
    setMatchNumber(undefined);
    setAlliance(undefined);
    setScreenState('setup');
  };

  const handleMatchComplete = async (
    blueScore: number,
    redScore: number,
    blueScores: ScoreMap,
    redScores: ScoreMap,
  ) => {
    let totalScore: number;
    let autoScore: number;
    let teleopScore: number;
    let allScores: ScoreMap | { blue: ScoreMap; red: ScoreMap };

    if (matchType === 'solo') {
      const allianceScores = alliance === 'red' ? redScores : blueScores;
      const result = computeScore(season, allianceScores);
      totalScore = result.total;
      autoScore = result.auto;
      teleopScore = result.teleop;
      allScores = allianceScores;
    } else {
      // full mode
      const blueResult = computeScore(season, blueScores);
      const redResult = computeScore(season, redScores);
      totalScore = blueScore + redScore;
      autoScore = blueResult.auto + redResult.auto;
      teleopScore = blueResult.teleop + redResult.teleop;
      allScores = { blue: blueScores, red: redScores };
    }

    try {
      await saveMatch({
        seasonId: season.id,
        timestamp: Date.now(),
        durationSeconds:
          season.timerDuration.autonomous +
          season.timerDuration.transition +
          season.timerDuration.teleop,
        allScores,
        totalScore,
        autoScore,
        teleopScore,
        matchNumber,
        alliance,
        matchType,
      });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Match Saved', `Total: ${totalScore} pts`);
    } catch (err) {
      console.error('Failed to save match:', err);
      Alert.alert('Save Failed', 'Could not save match. Please try again.');
    }
  };

  if (screenState === 'setup') {
    return (
      <SafeAreaView className="flex-1 bg-[#0F0F0F]">
        <MatchSetup season={season} onStart={handleStart} />
      </SafeAreaView>
    );
  }

  // active state
  if (matchType === 'timer_only') {
    return (
      <SafeAreaView className="flex-1 bg-[#0F0F0F]">
        <TimerOnlyMatch season={season} onBack={handleExit} />
      </SafeAreaView>
    );
  }

  // solo or full — landscape
  return (
    <LandscapeMatch
      season={season}
      matchType={matchType as 'solo' | 'full'}
      alliance={alliance}
      onExit={handleExit}
      onMatchComplete={handleMatchComplete}
    />
  );
}
