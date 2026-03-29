// app/(tabs)/match/index.tsx
import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  TextInput,
} from 'react-native';
import { useSeasonStore, useMatchStore, useHistoryStore, computeScore } from '../../../lib/store';
import { getSeasonById } from '../../../lib/seasonLoader';
import { MatchTimer } from '../../../components/timer/MatchTimer';
import { ModuleRenderer } from '../../../components/scoring/ModuleRenderer';
import { SeasonPicker } from '../../../components/ui/SeasonPicker';
import { ScoreBadge } from '../../../components/ui/ScoreBadge';
import { PhaseTab } from '../../../components/ui/PhaseTab';
import { UndoBar } from '../../../components/ui/UndoBar';
import type { ScoreValue } from '../../../types/match';

export default function MatchScreen() {
  const { selectedSeasonId } = useSeasonStore();
  const { phase, scores, setScore, resetMatch, strictMode, setStrictMode } = useMatchStore();
  const { saveMatch } = useHistoryStore();

  const [matchNumber, setMatchNumber] = React.useState<number | undefined>();
  const [alliance, setAlliance] = React.useState<'red' | 'blue' | undefined>();
  const [activeTab, setActiveTab] = React.useState<'auto' | 'teleop'>('auto');

  const season = getSeasonById(selectedSeasonId);
  const { auto, teleop, total } = computeScore(season, scores);

  useEffect(() => {
    if (phase === 'teleop' || phase === 'complete') {
      setActiveTab('teleop');
    } else if (phase === 'auto' || phase === 'idle') {
      setActiveTab('auto');
    }
  }, [phase]);

  const handleSaveMatch = async () => {
    await saveMatch({
      seasonId: season.id,
      timestamp: Date.now(),
      durationSeconds: season.timerDuration.autonomous + season.timerDuration.transition + season.timerDuration.teleop,
      allScores: scores,
      totalScore: total,
      autoScore: auto,
      teleopScore: teleop,
      matchNumber,
      alliance,
    });
    Alert.alert('Match Saved', `Total: ${total} pts (Auto: ${auto} | Teleop: ${teleop})`, [
      { text: 'New Match', onPress: resetMatch },
      { text: 'Keep', style: 'cancel' },
    ]);
  };

  const isLocked = (modulePeriod: 'auto' | 'teleop' | undefined, moduleArray: 'auto' | 'teleop') => {
    if (!strictMode) return false;   // All modules editable in relaxed mode
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

      {phase === 'idle' && (
        <View className="flex-row items-center px-4 mt-2 gap-3">
          {/* Match number */}
          <View className="flex-1 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-3 py-2">
            <Text className="text-[#9CA3AF] text-xs mb-1">Match #</Text>
            <TextInput
              className="text-[#F5F5F5] text-base"
              keyboardType="number-pad"
              placeholder="—"
              placeholderTextColor="#6B7280"
              value={matchNumber ? String(matchNumber) : ''}
              onChangeText={(t) => setMatchNumber(t ? parseInt(t, 10) : undefined)}
            />
          </View>

          {/* Alliance toggle */}
          <View className="flex-row gap-1">
            <TouchableOpacity
              onPress={() => setAlliance(alliance === 'red' ? undefined : 'red')}
              className={`px-4 py-3 rounded-xl border ${
                alliance === 'red' ? 'bg-[#EF4444] border-[#EF4444]' : 'bg-[#1A1A1A] border-[#2A2A2A]'
              }`}
            >
              <Text className={`font-semibold text-sm ${alliance === 'red' ? 'text-white' : 'text-[#EF4444]'}`}>
                RED
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setAlliance(alliance === 'blue' ? undefined : 'blue')}
              className={`px-4 py-3 rounded-xl border ${
                alliance === 'blue' ? 'bg-[#3B82F6] border-[#3B82F6]' : 'bg-[#1A1A1A] border-[#2A2A2A]'
              }`}
            >
              <Text className={`font-semibold text-sm ${alliance === 'blue' ? 'text-white' : 'text-[#3B82F6]'}`}>
                BLUE
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Strict mode toggle */}
      <View className="flex-row items-center justify-between px-4 mt-1">
        <Text className="text-[#9CA3AF] text-xs">
          {strictMode ? 'Strict mode — inputs locked by phase' : 'Relaxed — all inputs editable'}
        </Text>
        <TouchableOpacity
          onPress={() => setStrictMode(!strictMode)}
          className={`px-3 py-1 rounded-full border ${
            strictMode ? 'border-[#F59E0B] bg-[#F59E0B]/10' : 'border-[#2A2A2A] bg-[#1A1A1A]'
          }`}
        >
          <Text className={`text-xs font-medium ${strictMode ? 'text-[#F59E0B]' : 'text-[#9CA3AF]'}`}>
            {strictMode ? 'STRICT' : 'RELAXED'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Timer + score */}
      <View className="items-center py-4">
        <MatchTimer season={season} />
        <View className="mt-4">
          <ScoreBadge total={total} auto={auto} teleop={teleop} />
        </View>
      </View>

      {/* Phase tabs + scoring modules */}
      <View className="flex-1 overflow-hidden">
        <UndoBar />
        <PhaseTab
          activeTab={activeTab}
          onTabChange={setActiveTab}
          autoScore={auto}
          teleopScore={teleop}
        />
        <ScrollView
          className="flex-1 px-4"
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          {activeTab === 'auto' &&
            season.autonomous.map((module) => (
              <ModuleRenderer
                key={module.id}
                module={module}
                scores={scores}
                onChangeScore={(id, val) => setScore(id, val as ScoreValue)}
                disabled={isLocked(module.period, 'auto')}
                period="auto"
              />
            ))}
          {activeTab === 'teleop' &&
            season.teleop.map((module) => (
              <ModuleRenderer
                key={module.id}
                module={module}
                scores={scores}
                onChangeScore={(id, val) => setScore(id, val as ScoreValue)}
                disabled={isLocked(module.period, 'teleop')}
                period="teleop"
              />
            ))}
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
