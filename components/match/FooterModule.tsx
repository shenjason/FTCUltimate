import React from "react";
import type { ModuleConfig } from "../../types/season";
import type { ScoreValue } from "../../types/match";
import BooleanFooter from "./cases/BooleanFooter";
import CounterFooter from "./cases/CounterFooter";
import SelectorFooter from "./cases/SelectorFooter";
import MultiBooleanFooter from "./cases/MultiBooleanFooter";
import GridFooter from "./cases/GridFooter";
import CalculatedFooter from "./cases/CalculatedFooter";

interface FooterModuleProps {
  module: ModuleConfig;
  value: ScoreValue;
  onChange: (v: ScoreValue) => void;
  disabled?: boolean;
  alliance?: "red" | "blue";
  matchType?: "solo" | "full";
}

export function FooterModule({
  module,
  value,
  onChange,
  disabled = false,
  alliance = "blue",
  matchType = "full",
}: FooterModuleProps) {
  const isSolo = matchType === "solo";

  switch (module.type) {
    case "boolean":
      return (
        <BooleanFooter
          module={module}
          value={value}
          onChange={onChange}
          disabled={disabled}
          alliance={alliance}
          isSolo={isSolo}
        />
      );
    case "counter":
      return (
        <CounterFooter
          module={module}
          value={value}
          onChange={onChange}
          disabled={disabled}
          alliance={alliance}
          isSolo={isSolo}
        />
      );
    case "selector":
      return (
        <SelectorFooter
          module={module}
          value={value}
          onChange={onChange}
          disabled={disabled}
          alliance={alliance}
          isSolo={isSolo}
        />
      );
    case "multi_boolean":
      return (
        <MultiBooleanFooter
          module={module}
          value={value}
          onChange={onChange}
          disabled={disabled}
          alliance={alliance}
          isSolo={isSolo}
        />
      );
    case "grid":
      return (
        <GridFooter
          module={module}
          value={value}
          onChange={onChange}
          disabled={disabled}
          alliance={alliance}
          isSolo={isSolo}
        />
      );
    case "calculated":
      return (
        <CalculatedFooter
          module={module}
          computedValue={0}
          disabled={disabled}
          alliance={alliance}
          isSolo={isSolo}
        />
      );
    case "tiered_counter":
      // Reuse CounterFooter for tiered rendering for now — could add TieredFooter later
      return (
        <CounterFooter
          module={module}
          value={value}
          onChange={onChange}
          disabled={disabled}
          alliance={alliance}
          isSolo={isSolo}
        />
      );
    default:
      return null;
  }
}

export default FooterModule;
