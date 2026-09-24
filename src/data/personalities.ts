import { PersonalityType, GameState } from "../types";

export const PERSONALITY_TYPES: PersonalityType[] = [
  {
    id: "MODERN_MAVERICK",
    name: "THE MODERN MAVERICK",
    tags: "Nagpur × Technology × Ambition × Contemporary",
    quote: '"Rooted in where you come from. Driven by where you\'re going."',
    tagline: "Rooted in where you come from. Driven by where you're going.",
    desc: "You represent the bold new pulse of Nagpur—grounded in rich heritage while fearlessly pioneering digital infrastructure, smart urban architecture, and high ambition.",
    description:
      "You represent the bold new pulse of Nagpur—grounded in rich heritage while fearlessly pioneering digital infrastructure, smart urban architecture, and high ambition.",
    signatureCocktail: {
      name: "Nagpur Highball Edit",
      ingredients:
        "The Indian Edit Whisky, Nagpur Orange Reduction, Artisanal Tonic, Carbonated Spring Water",
      garnish: "Torched Orange Twist & Cinnamon Quill",
    },
  },
  {
    id: "HERITAGE_CURATOR",
    name: "THE HERITAGE CURATOR",
    tags: "Culture × Classic × Heritage",
    quote: '"Timeless wisdom is the ultimate luxury."',
    tagline: "Timeless wisdom is the ultimate luxury.",
    desc: "You cherish Nagpur's stone monuments, classical crafts, and traditional values. Every contemporary touch you craft honors the soul and architectural beauty of India's heartland.",
    description:
      "You cherish Nagpur's stone monuments, classical crafts, and traditional values. Every contemporary touch you craft honors the soul and architectural beauty of India's heartland.",
    signatureCocktail: {
      name: "Zero Mile Old Fashioned",
      ingredients:
        "The Indian Edit Whisky, Jaggery Syrup, Dehydrated Spiced Bitters",
      garnish: "Charred Orange Peel & Star Anise",
    },
  },
  {
    id: "CREATIVE_VISIONARY",
    name: "THE CREATIVE VISIONARY",
    tags: "Creativity × Art × Modern",
    quote: '"Tradition reimagined through the prism of design."',
    tagline: "Tradition reimagined through the prism of design.",
    desc: "You see Nagpur not just as a city, but as an open canvas. From hand-crafted textures to vibrant artistic expressions, you celebrate color, citrus rhythms, and visual poetry.",
    description:
      "You see Nagpur not just as a city, but as an open canvas. From hand-crafted textures to vibrant artistic expressions, you celebrate color, citrus rhythms, and visual poetry.",
    signatureCocktail: {
      name: "Citrus Smoke Boulevardier",
      ingredients:
        "The Indian Edit Whisky, Sweet Vermouth, Campari, Fresh Nagpur Mandarin Bitters",
      garnish: "Flamed Rosemary & Mandarin Wheel",
    },
  },
  {
    id: "LUXURY_EDITOR",
    name: "THE LUXURY EDITOR",
    tags: "Luxury × Premium × Contemporary",
    quote: '"Elegance is the quiet harmony of craft and provenance."',
    tagline: "Elegance is the quiet harmony of craft and provenance.",
    desc: "You appreciate bespoke finishes, warm amber depths, and super premium craftsmanship. Like The Indian Edit bottle, your standards reflect refined taste and enduring quality.",
    description:
      "You appreciate bespoke finishes, warm amber depths, and super premium craftsmanship. Like The Indian Edit bottle, your standards reflect refined taste and enduring quality.",
    signatureCocktail: {
      name: "The Sovereign Gold Sour",
      ingredients:
        "The Indian Edit Whisky, Cold-Pressed Orange Shrub, Wild Honey, Egg White, Gold Leaf",
      garnish: "24K Edible Gold Flake",
    },
  },
  {
    id: "FUTURE_BUILDER",
    name: "THE FUTURE BUILDER",
    tags: "Innovation × Growth × Futuristic",
    quote: '"Building sustainable legacy for the centuries ahead."',
    tagline: "Building sustainable legacy for the centuries ahead.",
    desc: "You envision Nagpur as a green, connected metropolis—uniting solar technology, biophilic architecture, and zero-mile logistics into a sustainable model for the world.",
    description:
      "You envision Nagpur as a green, connected metropolis—uniting solar technology, biophilic architecture, and zero-mile logistics into a sustainable model for the world.",
    signatureCocktail: {
      name: "Solar Spire Collins",
      ingredients:
        "The Indian Edit Whisky, Clarified Citrus Cordial, Ginger Ale, Soda",
      garnish: "Dehydrated Blood Orange Wheel & Mint Sprout",
    },
  },
];

export function computePersonality(state: GameState): PersonalityType {
  const decodedAllDetails = (state.decodeDetailsFound || 0) >= 5;
  const blendAttempts = state.blendIncorrectAttempts || 0;
  const blendPerfect =
    state.blendCompleted &&
    blendAttempts === 0 &&
    (state.blendSpeedBonus || 0) > 0;
  const blendClean = state.blendCompleted && blendAttempts === 0;
  const blendExperimental =
    state.blendCompleted && blendAttempts > 0 && blendAttempts <= 2;

  if (blendPerfect) {
    return PERSONALITY_TYPES[0]; // Modern Maverick
  }
  if (decodedAllDetails || blendClean) {
    return PERSONALITY_TYPES[1]; // Heritage Curator
  }
  if (blendExperimental) {
    return PERSONALITY_TYPES[2]; // Creative Visionary
  }
  if ((state.decodeScore || 0) >= 700) {
    return PERSONALITY_TYPES[3]; // Luxury Editor
  }
  if (!state.blendCompleted) {
    return PERSONALITY_TYPES[4]; // Future Builder
  }
  return PERSONALITY_TYPES[0];
}

export function computeMasterScore(state: GameState): number {
  // Total = sum of the three levels currently in the game.
  return (
    (state.decodeScore || 0) + (state.blendScore || 0) + (state.huntScore || 0)
  );
}
