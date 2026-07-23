import "../i18n";
import { useTranslation } from "react-i18next";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  ShieldCheck,
  Stethoscope,
  Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const { t, i18n } = useTranslation();

  return (
    <div className="min-h-screen bg-background">

      {/* Header */}
      <header className="border-b border-border bg-card/70 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">

          <div className="flex items-center gap-4">

            {/* Language Switcher */}
            <select
              value={i18n.language}
              onChange={(e) => i18n.changeLanguage(e.target.value)}
              className="border rounded-lg px-3 py-2 text-black"
            >
              <option value="en">English</option>
              <option value="te">తెలుగు</option>
            </select>

            <div className="h-9 w-9 rounded-lg bg-primary text-primary-foreground grid place-items-center">
              <Activity className="h-5 w-5" />
            </div>

            <span className="font-semibold text-foreground">
              MelioPredict
            </span>

          </div>

          <Link
            to="/predict"
            className="text-sm font-medium text-primary hover:underline"
          >
            {t("startPrediction")} →
          </Link>

        </div>
      </header>

      {/* Hero Section */}

      <section
        className="relative overflow-hidden"
        style={{ background: "var(--gradient-hero)" }}
      >
        <div className="max-w-6xl mx-auto px-6 py-24 text-center text-primary-foreground">

          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-medium backdrop-blur mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            {t("aiPowered")}
          </div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            {t("title")}
          </h1>

          <p className="mt-6 text-lg md:text-xl text-white/85 max-w-2xl mx-auto">
            {t("description")}
          </p>

          <div className="mt-10">
            <Link
              to="/predict"
              className="inline-flex items-center gap-2 rounded-lg bg-white text-primary px-8 py-4 text-base font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
            >
              {t("startPrediction")}
              <Stethoscope className="h-5 w-5" />
            </Link>
          </div>

        </div>
      </section>

      {/* Features */}

      <section className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-3 gap-6">

        {[
          {
            icon: Stethoscope,
            title: t("feature1Title"),
            desc: t("feature1Desc"),
          },
          {
            icon: Activity,
            title: t("feature2Title"),
            desc: t("feature2Desc"),
          },
          {
            icon: ShieldCheck,
            title: t("feature3Title"),
            desc: t("feature3Desc"),
          },
        ].map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="rounded-2xl border border-border bg-card p-6"
            style={{ boxShadow: "var(--shadow-medical)" }}
          >
            <div className="h-11 w-11 rounded-lg bg-accent text-primary grid place-items-center mb-4">
              <Icon className="h-5 w-5" />
            </div>

            <h3 className="font-semibold text-foreground">
              {title}
            </h3>

            <p className="mt-2 text-sm text-muted-foreground">
              {desc}
            </p>

          </div>
        ))}

      </section>

      {/* Footer */}

      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        {t("footer")}
      </footer>

    </div>
  );
}