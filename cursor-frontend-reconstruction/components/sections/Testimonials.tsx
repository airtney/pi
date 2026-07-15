import { SectionHeadline } from "@/components/SectionHeadline";
import {
  StaggeredShuffleTestimonials,
  type Testimonial,
} from "@/components/StaggeredShuffleTestimonials";

/**
 * "The new way to build software." — testimonial wall rendered by
 * `StaggeredShuffleTestimonials` (module 693744) under a centered
 * `SectionHeadline` (module 329329). The twelve testimonials mirror the
 * `testimonials` prop from the captured RSC Flight payload; the page shows
 * the first six (`initialIndices`). Avatars are mirrored into /public/avatars
 * from the cursor.com CDN.
 */
const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "It was night and day from one batch to another, adoption went from single digits to over 80%. It just spread like wildfire, all the best builders were using Cursor.",
    name: "Diana Hu",
    jobTitle: "General Partner",
    company: "Y Combinator",
    avatar: { src: "/avatars/diana-hu-avatar.png" },
  },
  {
    quote:
      "My favorite enterprise AI service is Cursor. Every one of our engineers, some 40,000, are now assisted by AI and our productivity has gone up incredibly.",
    name: "Jensen Huang",
    jobTitle: "President & CEO",
    company: "NVIDIA",
    avatar: { src: "/avatars/jensen-huang-avatar.png" },
  },
  {
    quote:
      "The best LLM applications have an autonomy slider: you control how much independence to give the AI. In Cursor, you can do Tab completion, Cmd+K for targeted edits, or you can let it rip with the full autonomy agentic version.",
    name: "Andrej Karpathy",
    jobTitle: "CEO",
    company: "Eureka Labs",
    avatar: { src: "/avatars/andrej-karpathy-avatar.png" },
  },
  {
    quote:
      "Cursor quickly grew from hundreds to thousands of extremely enthusiastic Stripe employees. We spend more on R&D and software creation than any other undertaking, and there's significant economic outcomes when making that process more efficient.",
    name: "Patrick Collison",
    jobTitle: "Co\u2011Founder & CEO",
    company: "Stripe",
    avatar: { src: "/avatars/patrick-collison-avatar.png" },
  },
  {
    quote:
      "The most useful AI tool that I currently pay for, hands down, is Cursor. It's fast, autocompletes when and where you need it to, handles brackets properly, sensible keyboard shortcuts, bring-your-own-model... everything is well put together.",
    name: "shadcn",
    jobTitle: "Creator of shadcn/ui",
    company: "",
    avatar: { src: "/avatars/shadcn-avatar.png" },
  },
  {
    quote:
      "It's definitely becoming more fun to be a programmer. We are at the 1% of what's possible, and it's in interactive experiences like Cursor where models like GPT-5 shine brightest.",
    name: "Greg Brockman",
    jobTitle: "President",
    company: "OpenAI",
    avatar: { src: "/avatars/greg-brockman-avatar.jpg" },
  },
  {
    quote:
      "We've seen features built in a day that might otherwise have taken weeks to prototype. It helps teams ramp up on unfamiliar codebases, generate meaningful code, and debug complex issues with more speed and confidence.",
    name: "Oscar Mullin",
    jobTitle: "VP of Technology",
    company: "Mercado Libre",
    avatar: { src: "/avatars/oscar-mullin-avatar.jpeg" },
  },
  {
    quote:
      "Cursor is the tool that every engineer (including me) instinctively turns to when navigating complexity or hitting a wall. With 100% adoption across our engineering team, Cursor has become an essential part of how we build.",
    name: "Ashwin Sreenivas",
    jobTitle: "Co-founder",
    company: "Decagon",
    avatar: { src: "/avatars/ashwin-sreenivas-avatar.jpeg" },
  },
  {
    quote:
      "Argued with Cursor for 10 minutes when it kept botsplaining me some code I myself wrote last year. Turns out it was right and I misremembered. Gonna go take a sip of tea and chill.",
    name: "Cheng Lou",
    jobTitle: "Software Engineer",
    company: "MidJourney",
    avatar: { src: "/avatars/cheng-lou-avatar.jpg" },
  },
  {
    quote:
      "Single engineers are now refactoring, upgrading, or building new codebases in days instead of months.",
    name: "Brian Armstrong",
    jobTitle: "CEO",
    company: "Coinbase",
    avatar: { src: "/avatars/brian-armstrong-avatar.jpeg" },
  },
  {
    quote:
      "Kick off a task and it will do days of work in a few minutes. And you can have as many as you want, working in parallel. This is what the future of AI Agents will look like across all categories of knowledge work.",
    name: "Aaron Levie",
    jobTitle: "CEO",
    company: "Box",
    avatar: { src: "/avatars/aaron-levie-avatar.jpg" },
  },
  {
    quote:
      "My design team has a 100% adoption of Cursor. All have demonstrated their ability to create simple coded prototypes and over 75% have shared complex prototypes. It's wild how fast this has been achieved.",
    name: "Cynthia Savard Saucier",
    jobTitle: "VP of UX",
    company: "Shopify",
    avatar: { src: "/avatars/cynthia-savard-saucier-avatar.jpg" },
  },
];

export function Testimonials() {
  return (
    <section className="section bg-theme-bg text-theme-text overflow-hidden">
      <div className="container">
        <SectionHeadline
          title="The new way to build software."
          alignment="center"
          semanticLevel="h2"
        />
      </div>
      <StaggeredShuffleTestimonials
        testimonials={TESTIMONIALS}
        showAvatar
        showAttribution
        initialIndices={[0, 1, 2, 3, 4, 5]}
      />
    </section>
  );
}
