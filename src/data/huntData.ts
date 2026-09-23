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
    duration: 30,
    background: "/assets/round-1.jpg",
    fallbackColor: "#170b05",
    bottles: [
      {
        id: "r1-b1",
        name: "Upper Bar Shelf",
        x: 30,
        y: 20.5,
        width: 4.8,
        height: 12.5,
        rotation: 0,
        opacity: 0.9,
        hint: "Resting on the upper carved bar shelf near the crystal decanters",
      },
      {
        id: "r1-b2",
        name: "Carved Jaali Arch",
        x: 58.0,
        y: 52.5,
        width: 5.0,
        height: 13.0,
        rotation: 1,
        opacity: 0.9,
        hint: "Framed inside the right carved teakwood ornamental arch",
      },
      {
        id: "r1-b3",
        name: "Brass Elephant Altar",
        x: 48.5,
        y: 60.5,
        width: 5.6,
        height: 14.2,
        rotation: 0,
        opacity: 0.9,
        hint: "Beside the sculpted brass elephant centerpiece on the marble counter",
      },
      {
        id: "r1-b4",
        name: "Crimson Drapery Alcove",
        x: 22.0,
        y: 58.0,
        width: 5.4,
        height: 13.8,
        rotation: -2,
        opacity: 0.9,
        hint: "Tucked within the velvet crimson drapery folds on the left",
      },
      {
        id: "r1-b5",
        name: "Lower Tasting Station",
        x: 86.0,
        y: 71.0,
        width: 5.4,
        height: 13.8,
        rotation: 2,
        opacity: 0.9,
        hint: "Positioned on the lower right cocktail bar console",
      },
    ],
  },
  {
    id: 2,
    title: "FIND THE SIGNATURE",
    subtitle: "Palace Courtyard & Salon",
    difficulty: "MEDIUM",
    duration: 25,
    background: "/assets/round-2.jpg",
    fallbackColor: "#140804",
    bottles: [
      {
        id: "r2-b1",
        name: "Marble Jali Lattice",
        x: 22.5,
        y: 54.0,
        width: 4.2,
        height: 11.2,
        rotation: -1,
        opacity: 0.9,
        hint: "Blended into the white marble lattice shadow on the left wall",
      },
      {
        id: "r2-b2",
        name: "Gold Leaf Fresco Console",
        x: 55.5,
        y: 68.0,
        width: 4.5,
        height: 11.8,
        rotation: 0,
        opacity: 0.9,
        hint: "Standing on the gilded console beneath the floral mural",
      },
      {
        id: "r2-b3",
        name: "Antique Hanging Lantern",
        x: 79.0,
        y: 60.5,
        width: 4.0,
        height: 10.5,
        rotation: 2,
        opacity: 0.9,
        hint: "Integrated beside the warm glowing brass lantern on the right",
      },
      {
        id: "r2-b4",
        name: "Elephant Pedestal Niche",
        x: 35.0,
        y: 63.5,
        width: 4.8,
        height: 12.2,
        rotation: 0,
        opacity: 0.9,
        hint: "Behind the engraved brass elephant ornament on the marble terrace",
      },
      {
        id: "r2-b5",
        name: "Courtyard Colonnade",
        x: 87,
        y: 64.0,
        width: 4.1,
        height: 10.8,
        rotation: -1,
        opacity: 0.9,
        hint: "Shadowed beneath the royal archway colonnade on the far right",
      },
    ],
  },
  {
    id: 3,
    title: "MASTER THE EDIT",
    subtitle: "The Grand Heritage Cellar",
    difficulty: "HARD",
    duration: 25,
    background: "/assets/round-3.jpg",
    fallbackColor: "#0a0402",
    bottles: [
      {
        id: "r3-b1",
        name: "Vintage Teakwood Cabinet",
        x: 27.5,
        y: 23.0,
        width: 3.5,
        height: 9.2,
        rotation: 0,
        opacity: 0.9,
        hint: "Inside the top upper compartment of the dark carved library cabinet",
      },
      {
        id: "r3-b2",
        name: "Mandala Mirror Reflection",
        x: 73.0,
        y: 56.5,
        width: 3.4,
        height: 8.8,
        rotation: 1,
        opacity: 1,
        hint: "Gleaming in the warm amber halo of the etched mirror reflection",
      },
      {
        id: "r3-b3",
        name: "Central Rare Tier",
        x: 45.5,
        y: 55.0,
        width: 3.8,
        height: 9.8,
        rotation: 0,
        opacity: 0.9,
        hint: "Nestled between the antique crystal decanters on the middle tier",
      },
      {
        id: "r3-b4",
        name: "Royal Woven Tapestry",
        x: 8.5,
        y: 60.5,
        width: 3.3,
        height: 8.6,
        rotation: -2,
        opacity: 0.9,
        hint: "Camouflaged against the dark embroidered royal tapestry on the left",
      },
      {
        id: "r3-b5",
        name: "Shadowed Tasting Cellar Shelf",
        x: 61.5,
        y: 76.0,
        width: 3.6,
        height: 9.4,
        rotation: 2,
        opacity: 0.9,
        hint: "Resting on the lower timber wine shelf beside the brass chalice",
      },
    ],
  },
];

export const SCORING = {
  BOTTLE_FOUND: 1000,
  WRONG_TAP: -100,
  TIME_BONUS_PER_SEC: 100,
  ALL_FOUND_BONUS: 2000,
};

export const DEBUG_MODE = false;
