import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal } from "react-native";
import type { StartMode } from "../../types/match";

interface HamburgerMenuProps {
  onExit: () => void;
  onSave: () => void;
  saveEnabled: boolean;
  startMode: StartMode;
  onToggleStartMode: () => void;
  canChangeStartMode: boolean;
  showSave?: boolean;
}

export function HamburgerMenu({
  onExit,
  onSave,
  saveEnabled,
  startMode,
  onToggleStartMode,
  canChangeStartMode,
  showSave,
}: HamburgerMenuProps) {
  const [visible, setVisible] = useState(false);
  const shouldShowSave = showSave !== false;

  const startFromLabel =
    startMode === "auto_teleop" ? "Start from Teleop" : "Start from Auto";

  return (
    <>
      <TouchableOpacity
        onPress={() => setVisible(true)}
        className="bg-surface px-3 py-1 rounded-lg"
      >
        <Text className="text-text-primary text-lg">≡</Text>
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        supportedOrientations={["portrait", "landscape"]}
        onRequestClose={() => setVisible(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setVisible(false)}
          className="flex-1 bg-black/60 justify-center items-center"
        >
          <View className="bg-surface rounded-xl p-4 w-64 gap-2">
            <TouchableOpacity
              onPress={() => {
                setVisible(false);
                onExit();
              }}
              className="bg-background p-3 rounded-lg"
            >
              <Text className="text-text-primary font-semibold text-center">
                Exit
              </Text>
            </TouchableOpacity>

            {shouldShowSave && (
              <TouchableOpacity
                onPress={() => {
                  setVisible(false);
                  onSave();
                }}
                disabled={!saveEnabled}
                className={`p-3 rounded-lg ${
                  saveEnabled ? "bg-background" : "bg-background opacity-40"
                }`}
              >
                <Text
                  className={`font-semibold text-center ${
                    saveEnabled ? "text-text-primary" : "text-text-secondary"
                  }`}
                >
                  Save
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={() => {
                onToggleStartMode();
                setVisible(false);
              }}
              disabled={!canChangeStartMode}
              className={`p-3 rounded-lg ${
                canChangeStartMode
                  ? "bg-background"
                  : "bg-background opacity-40"
              }`}
            >
              <Text
                className={`font-semibold text-center ${
                  canChangeStartMode
                    ? "text-text-primary"
                    : "text-text-secondary"
                }`}
              >
                {startFromLabel}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}
