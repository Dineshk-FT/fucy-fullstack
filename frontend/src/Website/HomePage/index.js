import React, { useEffect } from 'react';
import MainSection from '../MainSection';
import CyberSecuritySection from '../LearnAboutUs';
import CompliancePage from '../ComplianceSection';
import WhyComponent from '../WhySection';
import Contact from '../../Website/ContactSection'
import { useDispatch } from 'react-redux';
import { changePage } from '../../store/slices/PageSectionSlice';
import { changeCanvasPage } from '../../store/slices/CanvasSlice';
import { logout } from '../../store/slices/UserDetailsSlice';
export default function HomePage() {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(changePage('home'));
    dispatch(changeCanvasPage('home'));
    dispatch(logout());
  }, []);
  return (
    <>
      <MainSection />
      <CyberSecuritySection />
      <CompliancePage />
      <WhyComponent />
      <Contact />
    </>
  );
}
