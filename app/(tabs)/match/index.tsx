// app/(tabs)/match/index.tsx
import React, { useState, useEffect } from 'react';
import { Alert, Platform, useWindowDimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
const ScreenOrientation = Platform.OS !== "web"
  ? require("expo-screen-orientation")
  : null;
import * as Haptics from 'expo-haptics';
import { useSeasonStore, useMatchStore, useHistoryStore } from '../../../lib/store';
import { getSeasonById } from '../../../lib/seasonLoader';
import { MatchSetup } from '../../../components/match/MatchSetup';
import { TimerOnlyMatch } from '../../../components/match/TimerOnlyMatch';
import { LandscapeMatch } from '../../../components/match/LandscapeMatch';
import type { ScoreMap, MatchType, StartMode } from '../../../types/match';

type ScreenState = 'setup' | 'active';

export default function MatchScreen() {
  const { selectedSeasonId } = useSeasonStore();
  const { matchType, setMatchType, setMatchStarted, resetMatch } = useMatchStore();
  const { saveMatch } = useHistoryStore();

  const [screenState, setScreenState] = useState<ScreenState>('setup');
  const [alliance, setAlliance] = useState<'red' | 'blue' | undefined>();

  const season = getSeasonById(selectedSeasonId);

  // Slide transition animation
  const { width: screenWidth } = useWindowDimensions();
  const slideX = useSharedValue(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const slideAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: slideX.value }],
  }));

  // Lock to portrait on initial mount (setup state)
  useEffect(() => {
    ScreenOrientation?.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP)?.catch(() => {});
  }, []);

  const handleStart = async (
    type: MatchType,
    matchName: string,
    selectedAlliance: 'red' | 'blue',
    startMode: StartMode,
  ) => {
    useMatchStore.getState().setStartMode(startMode);
    useMatchStore.getState().setMatchName(matchName);
    setMatchType(type);
    setAlliance(type === 'full' ? undefined : selectedAlliance);
    setMatchStarted(true);

    // All match types use landscape
    await ScreenOrientation?.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE)?.catch(() => {});

    // Slide new screen in from right
    slideX.value = screenWidth;
    setScreenState('active');
    requestAnimationFrame(() => {
      slideX.value = withTiming(0, {
        duration: 300,
        easing: Easing.out(Easing.cubic),
      });
    });
  };

  const handleExit = async () => {
    await ScreenOrientation?.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP)?.catch(() => {});
    // Slide current screen out to right, then swap
    setIsAnimating(true);
    slideX.value = withTiming(screenWidth, {
      duration: 300,
      easing: Easing.in(Easing.cubic),
    }, (finished) => {
      if (finished) {
        runOnJS(setIsAnimating)(false);
        runOnJS(setMatchStarted)(false);
        runOnJS(resetMatch)();
        runOnJS(setAlliance)(undefined);
        runOnJS(setScreenState)('setup');
        slideX.value = 0;
      }
    });
  };

  const handleMatchComplete = async (result: any) => {
    let totalScore: number;
    let autoScore: number;
    let teleopScore: number;
    let allScores: ScoreMap | { blue: ScoreMap; red: ScoreMap };

    if (matchType === 'solo') {
      totalScore = result.totalScore ?? 0;
      autoScore = result.autoScore ?? 0;
      teleopScore = result.teleopScore ?? 0;
      allScores = result.scores ?? {};
    } else {
      // full mode
      const blueResult = result.blue ?? { total: 0, auto: 0, teleop: 0 };
      const redResult = result.red ?? { total: 0, auto: 0, teleop: 0 };
      totalScore = blueResult.total + redResult.total;
      autoScore = blueResult.auto + redResult.auto;
      teleopScore = blueResult.teleop + redResult.teleop;
      allScores = { blue: result.scores ?? {}, red: result.redScores ?? {} };
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
        matchName: useMatchStore.getState().matchName,
        startMode: useMatchStore.getState().startMode,
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
      <Animated.View style={[{ flex: 1, backgroundColor: '#0F0F0F' }, slideAnimStyle]}>
        <SafeAreaView className="flex-1 bg-[#0F0F0F]">
          <MatchSetup season={season} onStart={handleStart} />
        </SafeAreaView>
      </Animated.View>
    );
  }

  // active state
  if (matchType === 'timer_only') {
    return (
      <Animated.View style={[{ flex: 1, backgroundColor: '#0F0F0F' }, slideAnimStyle]}>
        <SafeAreaView className="flex-1 bg-[#0F0F0F]">
          <TimerOnlyMatch season={season} onExit={handleExit} />
        </SafeAreaView>
      </Animated.View>
    );
  }

  // solo or full — landscape
  return (
    <Animated.View style={[{ flex: 1 }, slideAnimStyle]}>
      <LandscapeMatch
        season={season}
        matchType={matchType as 'solo' | 'full'}
        alliance={alliance ?? "blue"}
        onExit={handleExit}
        onMatchComplete={handleMatchComplete}
      />
    </Animated.View>
  );
}
