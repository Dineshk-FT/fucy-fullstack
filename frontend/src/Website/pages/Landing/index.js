import React, { lazy, Suspense } from 'react';

import MainSection from '../../components/MainSection';
import CyberSecuritySection from '../../components/LearnAboutUs';
import CompliancePage from '../../components/ComplianceSection';
import WhyComponent from '../../components/WhySection';
import HeaderSection from './HeaderSection';
import FadeInDiv from '../../../ui-component/FadeInDiv';
const Footer = lazy(() => import('../../components/Footer'));

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
