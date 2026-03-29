// components/ui/SeasonPicker.tsx
import React from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSeasonStore } from '../../lib/store';

export function SeasonPicker() {
  const { seasons, selectedSeasonId, setSelectedSeason } = useSeasonStore();
  const [open, setOpen] = React.useState(false);
  const selected = seasons.find((s) => s.id === selectedSeasonId);

  return (
    <>
      <TouchableOpacity
        onPress={() => setOpen(true)}
        className="flex-row items-center bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-3 py-2"
      >
        <Text className="text-[#F5F5F5] text-sm flex-1" numberOfLines={1}>
          {selected?.name ?? 'Select season'}
        </Text>
        <Ionicons name="chevron-down" size={16} color="#9CA3AF" />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable className="flex-1 bg-black/60" onPress={() => setOpen(false)}>
          <View className="absolute bottom-0 left-0 right-0 bg-[#1A1A1A] rounded-t-2xl p-4">
            <Text className="text-[#F5F5F5] text-lg font-bold mb-3">Select Season</Text>
            <FlatList
              data={seasons}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className={`py-3 px-2 border-b border-[#2A2A2A] flex-row items-center justify-between`}
                  onPress={() => { setSelectedSeason(item.id); setOpen(false); }}
                >
                  <View>
                    <Text className="text-[#F5F5F5] text-sm font-medium">{item.name}</Text>
                    <Text className="text-[#9CA3AF] text-xs">{item.program} · {item.year}</Text>
                  </View>
                  {item.id === selectedSeasonId && (
                    <Ionicons name="checkmark" size={18} color="#3B82F6" />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </>
  );
}
