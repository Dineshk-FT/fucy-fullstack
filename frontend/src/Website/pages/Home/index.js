import React, { useEffect } from 'react';
import MainSection from '../../components/MainSection';
import CyberSecuritySection from '../../components/LearnAboutUs';
import CompliancePage from '../../components/ComplianceSection';
import WhyComponent from '../../components/WhySection';
import Contact from './ContactSection'
import { useDispatch } from 'react-redux';
import { changePage } from '../../../store/slices/PageSectionSlice';
import { changeCanvasPage } from '../../../store/slices/CanvasSlice';
import { logout } from '../../../store/slices/UserDetailsSlice';
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
