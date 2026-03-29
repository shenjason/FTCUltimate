// app/(tabs)/match/index.tsx
import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { useSeasonStore, useMatchStore, useHistoryStore, computeScore } from '../../../lib/store';
import { getSeasonById } from '../../../lib/seasonLoader';
import { MatchTimer } from '../../../components/timer/MatchTimer';
import { ModuleRenderer } from '../../../components/scoring/ModuleRenderer';
import { SeasonPicker } from '../../../components/ui/SeasonPicker';
import { ScoreBadge } from '../../../components/ui/ScoreBadge';
import type { ScoreValue } from '../../../types/match';

export default function MatchScreen() {
  const { selectedSeasonId } = useSeasonStore();
  const { phase, scores, setScore, resetMatch } = useMatchStore();
  const { saveMatch } = useHistoryStore();

  const season = getSeasonById(selectedSeasonId);
  const { auto, teleop, total } = computeScore(season, scores);

  // Slide animation: 0 = auto panel visible, 1 = teleop panel visible
  const slideProgress = useSharedValue(0);

  useEffect(() => {
    if (phase === 'teleop' || phase === 'complete') {
      slideProgress.value = withTiming(1, { duration: 400 });
    } else {
      slideProgress.value = withTiming(0, { duration: 400 });
    }
  }, [phase]);

  const autoStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(slideProgress.value, [0, 1], [0, -400]) }],
    opacity: interpolate(slideProgress.value, [0, 0.5], [1, 0]),
    position: 'absolute',
    width: '100%',
  }));

  const teleopStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(slideProgress.value, [0, 1], [400, 0]) }],
    opacity: interpolate(slideProgress.value, [0.5, 1], [0, 1]),
    position: 'absolute',
    width: '100%',
  }));

  const isAutoPhase = phase === 'idle' || phase === 'auto';
  const isTeleopPhase = phase === 'teleop' || phase === 'complete';

  const handleSaveMatch = async () => {
    await saveMatch({
      seasonId: season.id,
      timestamp: Date.now(),
      durationSeconds: season.timerDuration.autonomous + season.timerDuration.transition + season.timerDuration.teleop,
      allScores: scores,
      totalScore: total,
      autoScore: auto,
      teleopScore: teleop,
    });
    Alert.alert('Match Saved', `Total: ${total} pts (Auto: ${auto} | Teleop: ${teleop})`, [
      { text: 'New Match', onPress: resetMatch },
      { text: 'Keep', style: 'cancel' },
    ]);
  };

  const isLocked = (modulePeriod: 'auto' | 'teleop' | undefined, moduleArray: 'auto' | 'teleop') => {
    if (phase === 'transition') return true;
    if (phase === 'idle' || phase === 'complete') return false;
    if (phase === 'auto') return moduleArray !== 'auto';
    if (phase === 'teleop') return moduleArray !== 'teleop';
    return false;
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0F0F0F]">
      {/* Top bar */}
      <View className="flex-row items-center px-4 pt-3 pb-2 gap-3">
        <View className="flex-1">
          <SeasonPicker />
        </View>
      </View>
      {season.provisional && (
        <View className="mx-4 mt-2 bg-[#F59E0B]/10 border border-[#F59E0B]/30 rounded-xl px-3 py-2">
          <Text className="text-[#F59E0B] text-xs font-medium text-center">
            Provisional scoring — update when official manual releases
          </Text>
        </View>
      )}

      {/* Timer + score */}
      <View className="items-center py-4">
        <MatchTimer season={season} />
        <View className="mt-4">
          <ScoreBadge total={total} auto={auto} teleop={teleop} />
        </View>
      </View>

      {/* Scoring modules */}
      <View className="flex-1 overflow-hidden">
        <ScrollView
          className="flex-1 px-4"
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          {/* AUTO section */}
          <View className="mb-2">
            <Text className="text-[#EF4444] text-xs font-bold tracking-widest mb-2">
              ─ AUTONOMOUS
            </Text>
            {season.autonomous.map((module) => (
              <ModuleRenderer
                key={module.id}
                module={module}
                scores={scores}
                onChangeScore={(id, val) => setScore(id, val as ScoreValue)}
                disabled={isLocked(module.period, 'auto')}
                period={phase === 'auto' ? 'auto' : phase === 'transition' ? 'transition' : 'teleop'}
              />
            ))}
          </View>

          {/* Divider */}
          <View className="h-px bg-[#2A2A2A] my-4" />

          {/* TELEOP section */}
          <View className="mb-2">
            <Text className="text-[#22C55E] text-xs font-bold tracking-widest mb-2">
              ─ TELEOP
            </Text>
            {season.teleop.map((module) => (
              <ModuleRenderer
                key={module.id}
                module={module}
                scores={scores}
                onChangeScore={(id, val) => setScore(id, val as ScoreValue)}
                disabled={isLocked(module.period, 'teleop')}
                period={phase === 'auto' ? 'auto' : phase === 'transition' ? 'transition' : 'teleop'}
              />
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Bottom action bar */}
      <View className="px-4 pb-6 pt-3 flex-row gap-3 bg-[#0F0F0F] border-t border-[#2A2A2A]">
        <TouchableOpacity
          onPress={resetMatch}
          className="flex-1 py-3 rounded-xl border border-[#2A2A2A] items-center"
        >
          <Text className="text-[#9CA3AF] font-semibold">Reset</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleSaveMatch}
          disabled={phase !== 'complete'}
          className={`flex-2 px-6 py-3 rounded-xl items-center ${
            phase === 'complete' ? 'bg-[#3B82F6]' : 'bg-[#1A1A1A] border border-[#2A2A2A]'
          }`}
        >
          <Text
            className={`font-semibold ${phase === 'complete' ? 'text-white' : 'text-[#9CA3AF]'}`}
          >
            {phase === 'complete' ? `Save Match  ${total}pts` : 'Save Match'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
