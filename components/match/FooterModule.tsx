import React from "react";
import type { ModuleConfig } from "../../types/season";
import type { ScoreValue } from "../../types/match";
import renderFooter from "./footer";

interface FooterModuleProps {
  module: ModuleConfig;
  value: ScoreValue;
  onChange: (v: ScoreValue) => void;
  disabled?: boolean;
  alliance?: "red" | "blue";
  matchType?: "solo" | "full";
}

export function FooterModule(props: FooterModuleProps) {
  return renderFooter(props);
}

export default FooterModule;
