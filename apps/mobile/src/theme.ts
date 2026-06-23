import { useColorScheme } from "react-native";

const light = {
  background: "#f3efe5",
  surface: "#fffdf7",
  text: "#17231a",
  muted: "#59665d",
  primary: "#285b3c",
  accent: "#b88a3d",
  border: "#c9c3b6",
  danger: "#a51d22",
  success: "#24733f",
  warning: "#7d5414",
};

const dark = {
  background: "#101712",
  surface: "#18231b",
  text: "#f3efe5",
  muted: "#b8c2ba",
  primary: "#78b98d",
  accent: "#e0b86d",
  border: "#445047",
  danger: "#ff6568",
  success: "#6fd08d",
  warning: "#f0c774",
};

export function usePalette() {
  return useColorScheme() === "dark" ? dark : light;
}
