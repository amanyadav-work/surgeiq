import React from 'react'



import Footer from "@/components/ui/footer";
import LenisScroll from "@/components/ui/lenis-scroll";
import Navbar from "@/components/ui/navbar";
import AboutOurApps from "@/sections/about-our-apps";
import GetInTouch from "@/sections/get-in-touch";
import HeroSection from "@/sections/hero-section";
import OurLatestCreation from "@/sections/our-latest-creation";
import OurTestimonials from "@/sections/our-testimonials";
import SubscribeNewsletter from "@/sections/subscribe-newsletter";
import TrustedCompanies from "@/sections/trusted-companies";

export default function Page() {
  return (
    <>
      <LenisScroll />
      <Navbar />

      <main className="px-6 md:px-16 lg:px-24 xl:px-32">
        <HeroSection />
        <OurLatestCreation />
        <AboutOurApps />
        <OurTestimonials />
        <TrustedCompanies />
        <GetInTouch />
        <SubscribeNewsletter />
      </main>

      <Footer />
    </>
  );
}
