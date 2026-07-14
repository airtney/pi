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

export default function Home() {
  return (
    <main id="main">
      <Hero />
      <LogoGarden />
      <AgentsFeature />
      <AutonomousFeature />
      <EveryToolFeature />
      <AutomateFeature />
      <Testimonials />
      <Frontier />
      <Changelog />
      <Research />
      <CtaSection />
    </main>
  );
}
