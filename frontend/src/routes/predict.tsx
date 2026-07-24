import "../i18n";
import { useTranslation } from "react-i18next";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Activity, ArrowLeft, Loader2, Stethoscope } from "lucide-react";
import type { PredictionInput } from "@/lib/prediction";

export const Route = createFileRoute("/predict")({
  head: () => ({
    meta: [
      { title: "Prediction Form — MelioPredict" },
      { name: "description", content: "Enter symptoms, medical history and exposure factors to assess Melioidosis risk." },
    ],
  }),
  component: PredictPage,
});

const SYMPTOMS = [
  ["fever", "fever"],
  ["weakness", "weakness"],
  ["skinRedness", "skinRedness"],
  ["skinSwelling", "skinSwelling"],
  ["skinUlcer", "skinUlcer"],
  ["jointPain", "jointPain"],
  ["difficultyMoving", "difficultyMoving"],
  ["persistentCough", "persistentCough"],
] as const;

const HISTORY = [
  ["diabetes", "diabetes"],
  ["kidneyDisease", "kidneyDisease"],
  ["lungDisease", "lungDisease"],
  ["immuneDisorder", "immuneDisorder"],
] as const;

const EXPOSURE = [
  ["soilContact", "soilContact"],
  ["floodWater", "floodWater"],
  ["farmingActivity", "farmingActivity"],
  ["openWound", "openWound"],
  ["rainExposure", "rainExposure"],
] as const;

function PredictPage() {
  const { t } = useTranslation();
  const [image, setImage] = useState<File | null>(null);
  const navigate = useNavigate();
  const [age, setAge] = useState<number | "">("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [symptoms, setSymptoms] = useState<Record<string, boolean>>({});
  const [history, setHistory] = useState<Record<string, boolean>>({});
  const [exposure, setExposure] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = (
    setter: React.Dispatch<React.SetStateAction<Record<string, boolean>>>,
    key: string,
  ) => setter((s) => ({ ...s, [key]: !s[key] }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const input: PredictionInput = {
      age: typeof age === "number" ? age : 0,
      gender,
      symptoms,
      history,
      exposure,
    };
    const payload = {
  fever: symptoms.fever ? 1 : 0,
  weakness: symptoms.weakness ? 1 : 0,
  skin_redness: symptoms.skinRedness ? 1 : 0,
  skin_swelling: symptoms.skinSwelling ? 1 : 0,
  skin_ulcer: symptoms.skinUlcer ? 1 : 0,
  joint_pain: symptoms.jointPain ? 1 : 0,
  difficulty_moving: symptoms.difficultyMoving ? 1 : 0,
  persistent_cough: symptoms.persistentCough ? 1 : 0,

  diabetes: history.diabetes ? 1 : 0,
  kidney_disease: history.kidneyDisease ? 1 : 0,
  lung_disease: history.lungDisease ? 1 : 0,
  immune_disorder: history.immuneDisorder ? 1 : 0,

  soil_contact: exposure.soilContact ? 1 : 0,
  flood_water: exposure.floodWater ? 1 : 0,
  farming_activity: exposure.farmingActivity ? 1 : 0,
  open_wound: exposure.openWound ? 1 : 0,
  rain_exposure: exposure.rainExposure ? 1 : 0,

  age: Number(age),
  gender: gender === "male" ? 1 : 0,
};
    setSubmitting(true);
    try {
      const res = await fetch("https://meliopredict-backend.onrender.com/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Server responded ${res.status}`);
      const data = await res.json();
      sessionStorage.setItem("melio_result", JSON.stringify(data));
      sessionStorage.setItem(
  "melio_input",
  JSON.stringify({
    ...payload,
    imageUploaded: !!image,
    imageName: image ? image.name : "",
  })
);
      navigate({ to: "/result" });
    } catch (err) {
      setError(
        err instanceof Error
          ? `Could not reach prediction server: ${err.message}`
          : "Could not reach prediction server.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground grid place-items-center">
              <Activity className="h-4 w-4" />
            </div>
            <span className="font-semibold text-foreground">MelioPredict</span>
          </div>
        </div>
      </header>

      <form onSubmit={onSubmit} className="max-w-4xl mx-auto px-6 py-10 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
  {t("riskAssessment")}
</h1>
          <p className="mt-2 text-muted-foreground">
  {t("riskAssessmentDesc")}
</p>
        </div>

        <Section title={t("personalInformation")}>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground">{t("age")}</label>
              <input
                type="number"
                required
                min={0}
                max={120}
                value={age}
                onChange={(e) => setAge(e.target.value === "" ? "" : Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="e.g. 42"
              />
            </div>
            <div>
            <label className="text-sm font-medium text-foreground">
  {t("gender")}
</label>
              <div className="mt-1 flex gap-2">
                {(["male", "female"] as const).map((g) => (
                  <button
                    type="button"
                    key={g}
                    onClick={() => setGender(g)}
                    className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium capitalize transition-colors ${
                      gender === g
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-input bg-background text-foreground hover:bg-accent"
                    }`}
                  >
                    {t(g)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Section>

        <Section title={t("symptoms")}>
          <CheckGrid items={SYMPTOMS} state={symptoms} onToggle={(k) => toggle(setSymptoms, k)} />
        </Section>

        <Section title={t("medicalHistory")}>
          <CheckGrid items={HISTORY} state={history} onToggle={(k) => toggle(setHistory, k)} />
        </Section>

        <Section title={t("exposureHistory")}>
          <CheckGrid items={EXPOSURE} state={exposure} onToggle={(k) => toggle(setExposure, k)} />
        </Section>
       <Section title={t("uploadImage")}>

  <input
    type="file"
    accept="image/*"
    capture="environment"
    onChange={(e) => {
      if (e.target.files && e.target.files.length > 0) {
        setImage(e.target.files[0]);
      }
    }}
    className="mt-2 w-full rounded-lg border border-input p-3"
  />

  {image && (
    <div className="mt-5">

      <img
        src={URL.createObjectURL(image)}
        alt="Skin Lesion"
        className="w-60 rounded-xl border shadow-md"
      />

      <p className="mt-2 text-green-600 font-semibold">
        ✅ Image Uploaded Successfully
      </p>

      <p className="text-sm text-muted-foreground">
        {image.name}
      </p>

    </div>
  )}

  <p className="mt-3 text-sm text-muted-foreground">
      {t("uploadDesc")}
  </p>

</Section>

        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-4 text-base font-semibold text-primary-foreground shadow-lg hover:opacity-95 transition disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ boxShadow: "var(--shadow-medical)" }}
        >
          {submitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Predicting...
            </>
          ) : (
            <>
              <Stethoscope className="h-5 w-5" />
              {t("predictRisk")}
            </>
          )}
        </button>
      </form>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl border border-border bg-card p-6"
      style={{ boxShadow: "var(--shadow-medical)" }}
    >
      <h2 className="text-lg font-semibold text-foreground mb-4">{title}</h2>
      {children}
    </div>
  );
}



function CheckGrid({
  items,
  state,
  onToggle,
}: {
  items: readonly (readonly [string, string])[];
  state: Record<string, boolean>;
  onToggle: (k: string) => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2">
      {items.map(([key, label]) => {
        const active = !!state[key];

        return (
          <button
            key={key}
            type="button"
            onClick={() => onToggle(key)}
            className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm text-left transition-colors ${
              active
                ? "border-primary bg-accent text-accent-foreground"
                : "border-input bg-background text-foreground hover:bg-accent/50"
            }`}
          >
            <span
              className={`h-5 w-5 rounded border-2 grid place-items-center transition-colors ${
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-input"
              }`}
            >
              {active && (
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-3.5 w-3.5"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.7 5.3a1 1 0 010 1.4l-7 7a1 1 0 01-1.4 0l-3-3a1 1 0 111.4-1.4L9 11.6l6.3-6.3a1 1 0 011.4 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </span>

            {t(label)}
          </button>
        );
      })}
    </div>
  );
}