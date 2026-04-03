import React from "react";
import BooleanFooter from "./BooleanFooter";
import CounterFooter from "./CounterFooter";
import SelectorFooter from "./SelectorFooter";
import TieredCounterFooter from "./TieredCounterFooter";
import MultiBooleanFooter from "./MultiBooleanFooter";
import GridFooter from "./GridFooter";
import CalculatedFooter from "./CalculatedFooter";
import type { ModuleConfig } from "../../../types/season";
import type { ScoreValue } from "../../../types/match";

export interface FooterProps {
  module: ModuleConfig;
  value: ScoreValue;
  onChange: (v: ScoreValue) => void;
  disabled?: boolean;
  alliance?: "red" | "blue";
}

export default function renderFooter({
  module,
  value,
  onChange,
  disabled = false,
  alliance,
}: FooterProps) {
  switch (module.type) {
    case "boolean":
      return (
        <BooleanFooter
          module={module}
          value={value}
          onChange={onChange}
          disabled={disabled}
          alliance={alliance}
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
        />
      );
    case "tiered_counter":
      return (
        <TieredCounterFooter
          module={module}
          value={value}
          onChange={onChange}
          disabled={disabled}
          alliance={alliance}
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
        />
      );
    case "calculated":
      return <CalculatedFooter />;
    default:
      return null;
  }
}

export {
  BooleanFooter,
  CounterFooter,
  SelectorFooter,
  TieredCounterFooter,
  MultiBooleanFooter,
  GridFooter,
  CalculatedFooter,
};
