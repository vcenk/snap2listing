"use client";

import * as React from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { createTheme } from "@mui/material/styles";

// Import all landing page sections
import Navbar from "@/components/Landing_Sections/Navbar";
import Hero from "@/components/Landing_Sections/HeroSection";
import LogoCarousel from "@/components/Landing_Sections/LogoCarousel";
import ComparisonSection from "@/components/Landing_Sections/ComparisonSection";
import Features from "@/components/Landing_Sections/FeaturesSection";
import HowItWorks from "@/components/Landing_Sections/HowItWorksSection";
import NeonPricing from "@/components/Pricing/NeonPricing";
import Testimonials from "@/components/Landing_Sections/TestimonialsSection";
import CTA from "@/components/Landing_Sections/CTASection";
import FAQ from "@/components/Landing_Sections/FAQSection";
import Footer from "@/components/Landing_Sections/FooterSection";

export default function HomePage() {
  const theme = createTheme({
    palette: {
      mode: "light",
      primary: { main: "#6366F1" },
      secondary: { main: "#FF4B2B" },
      background: { default: "#fafafa", paper: "#ffffff" },
      text: { primary: "#1a1a1a", secondary: "#555" },
    },
    typography: {
      fontFamily: '"Poppins", "Inter", "Open Sans", sans-serif',
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      {/* Navigation */}
      <Navbar />

      {/* Main Content */}
      <main>
        {/* Hero Section with animated text */}
        <Hero />

        {/* Marketplace Logo Carousel */}
        <LogoCarousel />

        {/* Comparison Section - Manual vs Snap2Listing */}
        <ComparisonSection />

        {/* Features Section with cards and live preview */}
        <Features />

        {/* How It Works Section with flowchart animation */}
        <HowItWorks />

        {/* Neon-style Pricing Section */}
        <NeonPricing />

        {/* Testimonials Section */}
        <Testimonials />

        {/* Call to Action Section */}
        <CTA />

        {/* FAQ Section with accordions */}
        <FAQ />
      </main>

      {/* Footer */}
      <Footer />
    </ThemeProvider>
  );
}
