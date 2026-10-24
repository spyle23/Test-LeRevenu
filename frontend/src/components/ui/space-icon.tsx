import type { CSSProperties } from "react";
import {
  Armchair,
  Building2,
  ChartCandlestick,
  Coffee,
  Gem,
  Globe,
  type LucideIcon,
  MessagesSquare,
  PiggyBank,
  ReceiptEuro,
  Umbrella,
  Users,
  Wallet,
} from "lucide-react";
import type { CategoryRef } from "@/lib/strapi/types";

/** Icon keys are stored on the Category content type so editors can pick them in Strapi. */
const ICONS: Record<string, LucideIcon> = {
  candles: ChartCandlestick,
  globe: Globe,
  piggy: PiggyBank,
  umbrella: Umbrella,
  building: Building2,
  receipt: ReceiptEuro,
  armchair: Armchair,
  family: Users,
  gem: Gem,
  wallet: Wallet,
  coffee: Coffee,
};

interface SpaceIconProps {
  category: Pick<CategoryRef, "icon" | "color">;
  size?: number;
}

/** Coloured rounded tile, like the sidebar of macOS System Settings. */
export function SpaceIcon({ category, size = 22 }: SpaceIconProps) {
  const Icon = (category.icon && ICONS[category.icon]) || MessagesSquare;

  return (
    <span
      aria-hidden="true"
      className="space-tile inline-grid shrink-0 place-items-center text-white"
      style={
        {
          "--tile": category.color ?? "#8e8e93",
          width: size,
          height: size,
          borderRadius: size * 0.27,
        } as CSSProperties
      }
    >
      <Icon size={size * 0.6} strokeWidth={2.2} />
    </span>
  );
}
