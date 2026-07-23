export type PredictionInput = {
  age: number;
  gender: "male" | "female";
  symptoms: Record<string, boolean>;
  history: Record<string, boolean>;
  exposure: Record<string, boolean>;
};

export type PredictionResult = {
  disease: string;
  riskPercentage: number;
  confidenceScore: number;
  riskLevel: "High" | "Low";
  features: { name: string; weight: number }[];
};

const WEIGHTS: Record<string, number> = {
  fever: 8,
  weakness: 5,
  skinRedness: 6,
  skinSwelling: 6,
  skinUlcer: 9,
  jointPain: 5,
  difficultyMoving: 4,
  persistentCough: 7,
  diabetes: 12,
  kidneyDisease: 10,
  lungDisease: 9,
  immuneDisorder: 11,
  soilContact: 10,
  floodWater: 12,
  farmingActivity: 8,
  openWound: 11,
  rainExposure: 6,
};

const LABELS: Record<string, string> = {
  fever: "Fever",
  weakness: "Weakness",
  skinRedness: "Skin Redness",
  skinSwelling: "Skin Swelling",
  skinUlcer: "Skin Ulcer",
  jointPain: "Joint Pain",
  difficultyMoving: "Difficulty Moving",
  persistentCough: "Persistent Cough",
  diabetes: "Diabetes",
  kidneyDisease: "Kidney Disease",
  lungDisease: "Lung Disease",
  immuneDisorder: "Immune Disorder",
  soilContact: "Soil Contact",
  floodWater: "Flood Water Exposure",
  farmingActivity: "Farming Activity",
  openWound: "Open Wound",
  rainExposure: "Rain Exposure",
};

export function predict(input: PredictionInput): PredictionResult {
  const all = { ...input.symptoms, ...input.history, ...input.exposure };
  let score = 0;
  const contributing: { name: string; weight: number }[] = [];
  for (const [key, active] of Object.entries(all)) {
    if (active && WEIGHTS[key]) {
      score += WEIGHTS[key];
      contributing.push({ name: LABELS[key] ?? key, weight: WEIGHTS[key] });
    }
  }
  if (input.age >= 45) score += 6;
  if (input.age >= 60) score += 4;

  const max = Object.values(WEIGHTS).reduce((a, b) => a + b, 0) + 10;
  const risk = Math.min(98, Math.round((score / max) * 130));
  const confidence = Math.min(97, 60 + contributing.length * 2);
  contributing.sort((a, b) => b.weight - a.weight);

  return {
    disease: "Melioidosis (Burkholderia pseudomallei infection)",
    riskPercentage: risk,
    confidenceScore: confidence,
    riskLevel: risk >= 50 ? "High" : "Low",
    features: contributing.slice(0, 6),
  };
}