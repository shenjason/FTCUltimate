// Centralized theme and class tokens for colors used in JS/styled props
export const THEME = {
  colors: {
    footerRedBg: "#1a0808",
    footerBlueBg: "#080818",
    blueIcon: "#002d64",
    redIcon: "#490013",
    mutedIcon: "#a8abb6",
    brightIcon: "#e8eaf7",
    gold: "#fdc003",
    background: "#0a0e16",
    border: "#2A2A2A",
    // Additional tokens used across timer and dials
    labelMuted: "#9CA3AF",
    currentValue: "#F5F5F5",
    trackBg: "rgba(42, 42, 42, 0.6)",
    gradientOverlay: "rgba(10, 14, 22, 0.5)",
    selectedLayoutBg: "#00000026",
    containerBg: "#0000001a",
    // Badges (history screen)
    autoBadgeBg: "rgba(167,1,56,0.2)",
    autoBadgeText: "#ff6e84",
    autoBadgeLabel: "rgba(255,110,132,0.7)",
    teleopBadgeBg: "rgba(161,250,255,0.1)",
    teleopBadgeText: "#a1faff",
    teleopBadgeLabel: "rgba(161,250,255,0.7)",
    // Soft primary background used for selected icons/cards
    primarySoftBg: "rgba(132,173,255,0.2)",
    // Phase colors
    phaseIdle: "#3B82F6",
    phasePreAuto: "#EF4444",
    phaseAuto: "#EF4444",
    phaseTransition: "#F59E0B",
    phasePreTeleop: "#22C55E",
    phaseTeleop: "#22C55E",
    phaseComplete: "#3B82F6",
    // Module card tokens
    moduleCompactBlueBorder: "#1E3A5F",
    moduleCompactRedBorder: "#5F1E1E",
    moduleCompactBlueBg: "#0A1628",
    moduleCompactRedBg: "#280A0A",
    moduleBg: "#1A1A1A",
    // App / tab bar tokens
    primary: "#84adff",
    tabBarActiveBg: "#202632",
    tabBarBorder: "#202632",
  },
  // Keep className tokens here for quick reuse where Tailwind/nativewind
  // bracketed hex classes are used.
  classes: {
    footerRedBg: "bg-[#1a0808]",
    footerBlueBg: "bg-[#080818]",
    border1A: "border-[#1A1A1A]",
    border2A: "border-[#2A2A2A]",
  },
};

export default THEME;
