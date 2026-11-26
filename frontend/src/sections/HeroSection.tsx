import React from 'react';
import { Profile } from '../types';
import profileImage from '../assets/profile.jpg';
import { Lanyard } from '../components/lanyard/Lanyard';
import ColorBends from '../components/color-bends/ColorBends';
import TechText from '../components/tech-text/TechText';

interface HeroSectionProps {
  profile: Profile | null;
}

export const HeroSection: React.FC<HeroSectionProps> = () => {
  return (
    <section
      id="home"
      className="petalyx-scope relative overflow-x-clip bg-white min-h-screen flex flex-col lg:flex-row lg:items-center"
      style={{
        color: 'var(--ink)'
      }}
    >
      {/* 1. React Bits <ColorBends /> Shader Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <ColorBends
          colors={['#ff5c7a', '#8a5cff', '#00ffd1']}
          rotation={90}
          speed={0.2}
          scale={1}
          frequency={1}
          warpStrength={1}
          mouseInfluence={1}
          noise={0.15}
          parallax={0.5}
          iterations={1}
          intensity={1.5}
          bandWidth={6}
          transparent
        />

        {/* Smooth bottom blend into the clean section below */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-[#fafcf7]" />
      </div>

      {/* 2. Greeting + Interactive TechText Display Name Layer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-[25] w-full pt-28 lg:pt-0 pointer-events-none">
        <div className="lg:w-7/12 text-center lg:text-left space-y-1">
          <p className="text-xl sm:text-2xl md:text-3xl font-semibold text-[#121410]/80 tracking-tight pl-1">
            Hello, I&apos;m
          </p>
          <h1 className="w-full pointer-events-auto" aria-label="N V Sai Bharath Singamsetty">
            <span className="sr-only">N V Sai Bharath Singamsetty</span>
            <div className="w-full h-[88px] sm:h-[112px] lg:h-[126px] xl:h-[140px]">
              <TechText
                text="N V Sai Bharath"
                fontFamily="'Inter Tight', system-ui, sans-serif"
                fontWeight={800}
                fontSize={120}
                letterSpacing={-0.04}
                align="left"
                color="#121410"
                accentColor="#4d6a10"
                reveal="letter"
                dashLength={4}
                dashGap={2}
                specks={15}
                intro="none"
                introDuration={2}
                clickKick
                guides={false}
              />
            </div>
            <div className="w-full h-[88px] sm:h-[112px] lg:h-[126px] xl:h-[140px] -mt-3 sm:-mt-4">
              <TechText
                text="Singamsetty"
                fontFamily="'Inter Tight', system-ui, sans-serif"
                fontWeight={800}
                fontSize={120}
                letterSpacing={-0.04}
                align="left"
                color="#4d6a10"
                accentColor="#121410"
                reveal="letter"
                dashLength={4}
                dashGap={2}
                specks={15}
                intro="none"
                introDuration={2}
                clickKick
                guides={false}
              />
            </div>
          </h1>
          <p className="text-base sm:text-lg md:text-xl font-medium text-[#121410]/70 pt-1 pl-1">
            Welcome to my portfolio.
          </p>
        </div>
      </div>

      {/* 3. Full-Screen 3D Portrait Lanyard Layer (Always spans complete Home screen at every viewport width) */}
      <div className="absolute inset-0 w-full h-full z-20">
        <Lanyard
          frontImage={profileImage}
          orientation="portrait"
          finish="glossy"
          metal="silver"
          cardColor="#ffffff"
          strapColor="#94a3b8"
          anchor="right"
          cornerRadius={0.3}
          size={0.62}
          bandLength={0.2}
          bandWidth={0.8}
          gravity={1.65}
          damping={0.35}
          elasticity={0.5}
          breeze={0.5}
          interactive={true}
          intro={true}
        />
      </div>
    </section>
  );
};
