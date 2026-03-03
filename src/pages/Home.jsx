import React, { Suspense, lazy } from 'react';
import ServiceIntro from '../components/ServiceIntro';
import FeaturedCarousel from '../components/FeaturedCarousel';
import LatestNews from '../components/LatestNews';
import PortfolioSection from '../components/PortfolioSection';

const HeroSection = lazy(() => import('../components/hero/HeroSection'));

export default function Home() {
  return (
    <main>
      <Suspense fallback={<div className="w-full h-screen bg-[#0a0a0f]" />}>
        <HeroSection />
      </Suspense>

      {/* 서비스소개 */}
      <ServiceIntro />
      <FeaturedCarousel />

      {/* 포트폴리오 */}
      <PortfolioSection />

      {/* 블로그 */}
      <LatestNews />
    </main>
  );
}
