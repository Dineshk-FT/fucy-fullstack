/*eslint-disable*/
import React, { useEffect } from 'react';
import MainSection from '../../components/MainSection';
import CyberSecuritySection from '../../components/LearnAboutUs';
import CompliancePage from '../../components/ComplianceSection';
import WhyComponent from '../../components/WhySection';
import Contact from './ContactSection';
import { useDispatch } from 'react-redux';
import { changePage } from '../../../store/slices/PageSectionSlice';
import { logout } from '../../../store/slices/UserDetailsSlice';
export default function HomePage() {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(changePage('home'));
    window.sessionStorage.setItem('canvasState', 'home'); // Set canvas state to 'home' when on the home page
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
