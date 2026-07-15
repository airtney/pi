import { Hero } from "@/components/sections/Hero";
import { LogoGarden } from "@/components/sections/LogoGarden";
import {
  AgentsFeature,
  AutonomousFeature,
  EveryToolFeature,
  AutomateFeature,
} from "@/components/sections/FeatureSections";
import { Testimonials } from "@/components/sections/Testimonials";
import { Frontier } from "@/components/sections/Frontier";
import { Changelog } from "@/components/sections/Changelog";
import { Research } from "@/components/sections/Research";
import { CtaSection } from "@/components/sections/CtaSection";
import { ChangelogProvider } from "@/components/ChangelogProvider";
import { CHANGELOG_DATA } from "@/lib/changelog-data";

export default function Home() {
  // The Flight payload wraps <main> in a ChangelogProvider fed with the four
  // most recent releases; the Changelog section reads them via context.
  return (
    <ChangelogProvider changelogData={CHANGELOG_DATA}>
      <main id="main">
        <Hero />
        <LogoGarden />
        <AgentsFeature />
        <AutonomousFeature />
        <EveryToolFeature />
        <AutomateFeature />
        <Testimonials />
        <Frontier />
        <Changelog title="Changelog" titleClassName="type-md" semanticLevel="h2" />
        <Research />
        <CtaSection />
      </main>
    </ChangelogProvider>
  );
}
