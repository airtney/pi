import { Changelog } from "@/components/Changelog";
import { CtaSection } from "@/components/CtaSection";
import { FeatureSections } from "@/components/FeatureSections";
import { Footer } from "@/components/Footer";
import { Frontier } from "@/components/Frontier";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Highlights } from "@/components/Highlights";
import { LogoCloud } from "@/components/LogoCloud";
import { TeamSection } from "@/components/TeamSection";
import { Testimonials } from "@/components/Testimonials";

export default function Home() {
	return (
		<>
			<Header />
			<main id="main">
				<Hero />
				<LogoCloud />
				<FeatureSections />
				<Testimonials />
				<Frontier />
				<Changelog />
				<TeamSection />
				<Highlights />
				<CtaSection />
			</main>
			<Footer />
		</>
	);
}
