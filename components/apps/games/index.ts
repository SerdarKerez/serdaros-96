/* SerdarOS 96 — calculator + games app definitions. Owner: builder-games. */
import type { AppDef } from "@/lib/os-types";
import Calculator from "./Calculator";
import Snake from "./Snake";
import Mines from "./Mines";
import Stack from "./Stack";

export const gameApps: AppDef[] = [
  { id: "calculator", title: "Calculator", icon: "calculator", width: 350, height: 480, minWidth: 280, minHeight: 450, Component: Calculator },
  { id: "snake", title: "Riff Snake", icon: "snake", width: 440, height: 660, minWidth: 300, minHeight: 440, Component: Snake },
  { id: "mines", title: "Minesweeper", icon: "mines", width: 430, height: 640, minWidth: 300, minHeight: 450, Component: Mines },
  { id: "stack", title: "Box Stack", icon: "stack", width: 430, height: 660, minWidth: 300, minHeight: 450, Component: Stack },
];
