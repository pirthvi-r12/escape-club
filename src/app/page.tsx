import { DestinationRail } from "@/components/landing/DestinationRail";
import { ExperienceMosaic } from "@/components/landing/ExperienceMosaic";
import { Hero } from "@/components/landing/Hero";
import { JoinCTA } from "@/components/landing/JoinCTA";
import { Manifesto } from "@/components/landing/Manifesto";
import { StatsBand } from "@/components/landing/StatsBand";
import { Testimonials } from "@/components/landing/Testimonials";
import { ZoomThroughStory } from "@/components/landing/ZoomThroughStory";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { Curtain } from "@/components/site/Curtain";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteNav } from "@/components/site/SiteNav";
import { getSessionUser } from "@/lib/auth";

export default async function LandingPage() {
  const user = await getSessionUser();

  return (
    <SmoothScroll>
      <Curtain />
      <SiteNav user={user} />

      <main>
        <Hero />
        <Manifesto />
        <ZoomThroughStory />

        <div id="destinations">
          <DestinationRail />
        </div>

        <StatsBand />

        <div id="experiences">
          <ExperienceMosaic />
        </div>

        <div id="members">
          <Testimonials />
        </div>

        <JoinCTA />
      </main>

      <SiteFooter />
    </SmoothScroll>
  );
}
