import "../i18n";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  Activity,
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";
type ApiResult = {
  prediction: string;
  probability: number;
};

export const Route = createFileRoute("/result")({
  component: ResultPage,
});

function ResultPage() {
  const [result, setResult] = useState<ApiResult | null>(null);
  const [input, setInput] = useState<any>(null);
  const { t, i18n } = useTranslation();
  const showClinicalPresentation = !i18n.language.toLowerCase().startsWith("te");

  useEffect(() => {
  const raw = sessionStorage.getItem("melio_result");
  if (raw) setResult(JSON.parse(raw));

  const patient = sessionStorage.getItem("melio_input");
  if (patient) setInput(JSON.parse(patient));
}, []);

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h2 className="text-xl font-bold">
          {t("noPredictionFound")}
        </h2>
      </div>
    );
  }

  const isHigh = result.prediction === "High Risk";
  const symptomCount = [
  input?.fever,
  input?.weakness,
  input?.skin_redness,
  input?.skin_swelling,
  input?.skin_ulcer,
  input?.joint_pain,
  input?.difficulty_moving,
  input?.persistent_cough,
].filter(Boolean).length;

  const severityLabelMap = {
    Mild: "severityMild",
    Moderate: "severityModerate",
    Severe: "severitySevere",
  } as const;

  const stageLabelMap = {
    "General Observation": "stageGeneralObservation",
    "Localized Skin Infection": "stageLocalizedSkinInfection",
    "Possible Pulmonary Infection": "stagePossiblePulmonaryInfection",
    "Possible Systemic Infection": "stagePossibleSystemicInfection",
  } as const;

let severity: keyof typeof severityLabelMap = "Mild";

if (
  isHigh &&
  (
    input?.skin_ulcer ||
    input?.persistent_cough ||
    input?.diabetes ||
    input?.immune_disorder
  )
) {
  severity = "Severe";
} else if (isHigh || symptomCount >= 3) {
  severity = "Moderate";
}
let stage: keyof typeof stageLabelMap = "General Observation";

if (
  input?.skin_redness &&
  input?.skin_swelling &&
  input?.skin_ulcer
) {
  stage = "Localized Skin Infection";
}

if (
  input?.persistent_cough &&
  input?.fever
) {
  stage = "Possible Pulmonary Infection";
}

if (
  input?.joint_pain &&
  input?.weakness &&
  input?.fever
) {
  stage = "Possible Systemic Infection";
}
let antibiotics: Array<
  | "noAntibioticsRecommended"
  | "consultPhysicianIfSymptomsPersist"
  | "ceftazidime"
  | "meropenem"
  | "imipenem"
  | "trimethoprimSulfamethoxazole"
> = [];

if (severity === "Mild") {
  antibiotics = [
    "noAntibioticsRecommended",
    "consultPhysicianIfSymptomsPersist",
  ];
}

if (severity === "Moderate") {
  antibiotics = [
    "ceftazidime",
    "meropenem",
  ];
}

if (severity === "Severe") {
  antibiotics = [
    "meropenem",
    "imipenem",
    "ceftazidime",
    "trimethoprimSulfamethoxazole",
  ];
}
let tests: Array<
  | "completeBloodCount"
  | "bloodCulture"
  | "chestXRay"
  | "woundCulture"
  | "bloodSugarTest"
> = ["completeBloodCount"];

if (isHigh)
  tests.push("bloodCulture");

if (input?.persistent_cough)
  tests.push("chestXRay");

if (input?.skin_ulcer)
  tests.push("woundCulture");

if (input?.diabetes)
  tests.push("bloodSugarTest");

  const severityLabel = severityLabelMap[severity];
  const stageLabel =
    stageLabelMap[stage as keyof typeof stageLabelMap] ||
    "stageGeneralObservation";


  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link
            to="/predict"
            className="flex items-center gap-2 text-sm hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("newAssessment")}
          </Link>

          <div className="flex items-center gap-2">
            <Activity className="text-primary" />
            <span className="font-bold">{t("appName")}</span>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-10">

        <div className="flex items-center justify-between mb-6">

  <h1 className="text-3xl font-bold mb-6">
    {t("predictionResult")}
  </h1>

</div>

        <div className="bg-card rounded-xl border p-8 shadow-lg">

          <div className="flex items-center justify-between">

            <div>

              <h2 className="text-lg text-muted-foreground">
                {t("diseasePrediction")}
              </h2>

              <h1
                className={`text-3xl font-bold mt-2 ${
                  isHigh ? "text-red-600" : "text-green-600"
                }`}
              >
                {isHigh ? t("highRisk") : t("lowRisk")}
              </h1>

            </div>

            <div
              className={`px-5 py-3 rounded-full font-semibold ${
                isHigh
                  ? "bg-red-100 text-red-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {isHigh ? (
                <>
                  <AlertTriangle className="inline mr-2 h-5 w-5" />
                  {t("highRisk")}
                </>
              ) : (
                <>
                  <CheckCircle2 className="inline mr-2 h-5 w-5" />
                  {t("lowRisk")}
                </>
              )}
            </div>

          </div>

          <div className="mt-10">

            <h2 className="text-lg font-semibold">
              {t("modelConfidence")}
            </h2>

            <div className="mt-4 h-6 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full ${
                  isHigh ? "bg-red-500" : "bg-green-500"
                }`}
                style={{ width: `${result.probability}%` }}
              />
            </div>

            <p className="mt-2 font-semibold">
              {t("confidencePercentage", { percent: result.probability })}
            </p>

          </div>

        </div>

        {/* ===================== Clinical Guidance ===================== */}

<div
  className="mt-8 bg-card border rounded-xl p-6"
  style={{ boxShadow: "var(--shadow-medical)" }}
>

  <h2 className="text-xl font-bold mb-4">
    {t("clinicalGuidance")}
  </h2>

  <div className="space-y-3">

    <p>
      <strong>{t("severityLevel")}</strong> {t(severityLabel)}
    </p>

    {showClinicalPresentation && (
      <p>
        <strong>{t("possibleClinicalPresentation")}</strong> {t(stageLabel)}
      </p>
    )}

  </div>

  <div className="mt-6">

    <h3 className="font-semibold">
      {t("suggestedDiagnosticTests")}
    </h3>

    <ul className="list-disc ml-6 mt-3 space-y-2">
      {tests.map((test) => (
        <li key={test}>{t(test)}</li>
      ))}
    </ul>

  </div>

  <div className="mt-6">

    <h3 className="font-semibold">
      {t("commonAntibioticsUsed")}
    </h3>

    <ul className="list-disc ml-6 mt-3 space-y-2">
      {antibiotics.map((drug) => (
        <li key={drug}>{t(drug)}</li>
      ))}
    </ul>

  </div>

  <div className="mt-6 p-4 rounded-lg bg-yellow-50 border border-yellow-300">

    <h4 className="font-semibold text-yellow-700">
      {t("educationalNote")}
    </h4>

    <p className="mt-2 text-sm text-gray-700">
      {t("educationalNoteBody")}
    </p>

  </div>

</div>

{/* ===================== Recommendation ===================== */}

<div className="mt-8 bg-card border rounded-xl p-6">

  <h2 className="text-xl font-bold mb-3">
    {t("recommendation")}
  </h2>

  {isHigh ? (
    <div className="text-red-700 leading-7">
      <p>
        {t("predictionIndicatesHighRisk")}
      </p>

      <ul className="list-disc ml-6 mt-3 space-y-2">
        <li>{t("consultDoctor")}</li>
        <li>{t("performBloodCulture")}</li>
        <li>{t("seekAntibioticEvaluation")}</li>
        <li>{t("avoidDelayInTreatment")}</li>
      </ul>
    </div>
  ) : (
    <div className="text-green-700 leading-7">
      <p>
        {t("predictionIndicatesLowRisk")}
      </p>

      <ul className="list-disc ml-6 mt-3 space-y-2">
        <li>{t("maintainGoodHygiene")}</li>
        <li>{t("avoidExposure")}</li>
        <li>{t("monitorSymptoms")}</li>
        <li>{t("consultIfWorsen")}</li>
      </ul>
    </div>
  )}

</div>
          
        

        <div className="mt-8 bg-card border rounded-xl p-6">

          <h2 className="font-semibold mb-3">
            {t("apiResponse")}
          </h2>

          <pre className="bg-gray-100 rounded-lg p-4 overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>

        </div>

        <div className="mt-8 text-center">

          <Link
            to="/predict"
            className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg"
          >
            <RotateCcw className="h-4 w-4" />
            {t("runAnotherAssessment")}
          </Link>

        </div>

      </div>
    </div>
  );
}