// components/ui/UndoBar.tsx
import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useMatchStore } from "../../lib/store";
import THEME from "../../lib/theme";

export function UndoBar() {
  const { undoStack, redoStack, undo, redo } = useMatchStore();

  const handleUndo = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    undo();
  };

  const handleRedo = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    redo();
  };

  if (undoStack.length === 0 && redoStack.length === 0) return null;

  return (
    <View className="absolute top-2 right-4 flex-row gap-2 z-10">
      <TouchableOpacity
        onPress={handleUndo}
        disabled={undoStack.length === 0}
        className={`w-9 h-9 rounded-full items-center justify-center border ${
          undoStack.length > 0
            ? "bg-surface border border-outline-variant"
            : `bg-surface-dim border ${THEME.classes.border1A}`
        }`}
      >
        <Ionicons
          name="arrow-undo"
          size={16}
          color={
            undoStack.length > 0
              ? THEME.colors.currentValue
              : THEME.colors.mutedIcon
          }
        />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={handleRedo}
        disabled={redoStack.length === 0}
        className={`w-9 h-9 rounded-full items-center justify-center border ${
          redoStack.length > 0
            ? "bg-surface border border-outline-variant"
            : `bg-surface-dim border ${THEME.classes.border1A}`
        }`}
      >
        <Ionicons
          name="arrow-redo"
          size={16}
          color={
            redoStack.length > 0
              ? THEME.colors.currentValue
              : THEME.colors.mutedIcon
          }
        />
      </TouchableOpacity>
    </View>
  );
}
