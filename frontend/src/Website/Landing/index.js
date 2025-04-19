import React, { lazy, Suspense } from 'react';
// import CareerPage from "../CareerPage";
import MainSection from './MainSection';
import CyberSecuritySection from './LearnAboutUs';
import CompliancePage from './ComplianceSection';
import WhyComponent from './WhySection';
import HeaderSection from './HeaderSection';
import FadeInDiv from '../../ui-component/FadeInDiv';
const Footer = lazy(() => import('./Footer'));

export default function HomePage() {
  return (
    <>
      <FadeInDiv>
        <HeaderSection />
        <MainSection />
        <CyberSecuritySection />
        <CompliancePage />
        <WhyComponent />
        <Suspense fallback={<div>Loading Footer...</div>}>
          <Footer />
        </Suspense>
      </FadeInDiv>
      {/* <CareerPage/> */}
    </>
  );
}
