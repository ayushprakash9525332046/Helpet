import React from "react";
import { 
  Sparkles, 
  Droplets, 
  Wrench, 
  Zap, 
  Hammer, 
  Palette, 
  Snowflake, 
  Scissors, 
  Bug, 
  Settings, 
  Home,
  LucideIcon,
  Trash2,
  Brush,
  Wind,
  Layers,
  ShoppingBag,
  Heart,
  Car,
  Lightbulb,
  Plug,
  Thermometer,
  CloudRain,
  Activity,
  User,
  Shield,
  ZapIcon
} from "lucide-react";

export const SERVICE_ICONS: Record<string, LucideIcon> = {
  clean: Sparkles,
  plumb: Wrench,
  electr: Zap,
  light: Lightbulb,
  plug: Plug,
  carp: Hammer,
  paint: Palette,
  ac: Snowflake,
  wind: Wind,
  cool: Thermometer,
  salon: Scissors,
  hair: Scissors,
  pest: Bug,
  bug: Bug,
  repair: Settings,
  fix: Wrench,
  trash: Trash2,
  waste: Trash2,
  brush: Brush,
  wash: Droplets,
  water: Droplets,
  garden: CloudRain,
  leaf: Activity,
  health: Activity,
  spa: Heart,
  beauty: Scissors,
  car: Car,
  auto: Car,
  home: Home,
  shield: Shield,
  safe: Shield,
  quick: ZapIcon,
  fast: ZapIcon,
};

export function getServiceIcon(name: string): LucideIcon {
  const n = (name || "").toLowerCase();
  for (const [key, Icon] of Object.entries(SERVICE_ICONS)) {
    if (n.includes(key)) return Icon;
  }
  return Home;
}

export function ServiceIcon({ 
  name, 
  size = 20, 
  className = "" 
}: { 
  name: string; 
  size?: number; 
  className?: string;
}) {
  const Icon = getServiceIcon(name);
  return <Icon size={size} className={className} />;
}
