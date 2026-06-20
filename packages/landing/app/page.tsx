import { AnnouncementBar } from "@/components/AnnouncementBar";
import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { ClaimSection } from "@/components/ClaimSection";
import { Features } from "@/components/Features";
import { ProductSection } from "@/components/ProductSection";
import { TelemetrySection } from "@/components/TelemetrySection";
import { HowItWorks } from "@/components/HowItWorks";
import { Faq } from "@/components/Faq";
import { FinalCta } from "@/components/FinalCta";
import { Footer } from "@/components/Footer";
import { fetchGlobalTotals, fetchLeaderboard } from "@/lib/supabase";
import { SERVER_REVALIDATE_SECONDS } from "@/lib/config";
import type { LiveData } from "@/lib/useLiveData";

// Server fetch with ISR-style revalidation; client polling keeps it live after.
export const revalidate = 30;

export default async function Page() {
  const [totals, leaderboard] = await Promise.all([
    fetchGlobalTotals({ revalidate: SERVER_REVALIDATE_SECONDS }),
    fetchLeaderboard({ revalidate: SERVER_REVALIDATE_SECONDS }),
  ]);

  const initial: LiveData = { totals, leaderboard };

  return (
    <>
      <AnnouncementBar />
      <Nav />
      <main>
        <Hero />
        <ClaimSection />
        <Features />
        <ProductSection />
        <TelemetrySection initial={initial} />
        <HowItWorks />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
