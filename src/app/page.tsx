import LandingNav from "./_components/landing/LandingNav";
import HeroSection from "./_components/landing/HeroSection";
import FlowStepsSection from "./_components/landing/FlowStepsSection";
import BeforeAfterSection from "./_components/landing/BeforeAfterSection";
import VisaTypesSection from "./_components/landing/VisaTypesSection";
import CTASection from "./_components/landing/CTASection";
import Footer from "./_components/landing/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <LandingNav />
      <HeroSection />
      <FlowStepsSection />
      <BeforeAfterSection />
      <VisaTypesSection />
      <CTASection />
      <Footer />
    </div>
  );
}
