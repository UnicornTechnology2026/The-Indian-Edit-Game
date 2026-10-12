export interface HiddenBottle {
  id: string;
  name: string;
  x: number; // % from left
  y: number; // % from top
  width: number; // % width
  height: number; // % height
  rotation?: number; // subtle angle
  opacity?: number; // natural ambient blending
  blendMode?: "normal" | "multiply" | "screen" | "overlay";
  hint: string;
}

export interface HuntRound {
  id: number;
  title: string;
  subtitle: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  duration: number; // in seconds
  background: string;
  fallbackColor: string;
  bottles: HiddenBottle[];
}

export const HUNT_ROUNDS: HuntRound[] = [
  {
    id: 1,
    title: "FIND THE EDIT",
    subtitle: "The Royal Lounge & Bar",
    difficulty: "EASY",
    duration: 25,
    background: "/assets/round-1.jpg",
    fallbackColor: "#170b05",
    bottles: [
      {
        id: "r1-b1",
        name: "Upper Bar Shelf",
        x: 30,
        y: 24.5,
        width: 5,
        height: 10,
        rotation: 0,
        opacity: 0.9,
        hint: "Resting on the upper carved bar shelf near the crystal decanters",
      },
      {
        id: "r1-b2",
        name: "Carved Jaali Arch",
        x: 49.0,
        y: 7,
        width: 5.0,
        height: 10.0,
        rotation: 9,
        opacity: 0.6,
        hint: "Framed inside the right carved teakwood ornamental arch",
      },
      {
        id: "r1-b3",
        name: "Brass Elephant Altar",
        x: 48.5,
        y: 62,
        width: 5,
        height: 10,
        rotation: 0,
        opacity: 0.9,
        hint: "Beside the sculpted brass elephant centerpiece on the marble counter",
      },
      {
        id: "r1-b4",
        name: "Crimson Drapery Alcove",
        x: 20,
        y: 62.0,
        width: 5,
        height: 10,
        rotation: -2,
        opacity: 1,
        hint: "Tucked within the velvet crimson drapery folds on the left",
      },
      {
        id: "r1-b5",
        name: "Lower Tasting Station",
        x: 86.0,
        y: 73.0,
        width: 5,
        height: 10,
        rotation: 2,
        opacity: 0.8,
        hint: "Positioned on the lower right cocktail bar console",
      },
    ],
  },
];

export const SCORING = {
  BOTTLE_FOUND: 10,
  WRONG_TAP: -5,
  ALL_FOUND_BONUS: 0,
  QUICK_COMPLETE_TIME_LIMIT: 10, // seconds
  QUICK_COMPLETE_BONUS: 20,
};

export const DEBUG_MODE = false;
