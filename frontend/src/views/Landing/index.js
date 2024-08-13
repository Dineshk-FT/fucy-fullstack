import React from "react";
// import CareerPage from "../CareerPage";
import MainSection from "./MainSection";
import CyberSecuritySection from "./LearnAboutUs";
import CompliancePage from "./ComplianceSection";
import WhyComponent from "./WhySection";
import Footer from "./Footer";
import HeaderSection from "./HeaderSection";

export default function HomePage() {
  return <>
  <HeaderSection/>
  <MainSection/>
  <CyberSecuritySection/>
  <CompliancePage/>
  <WhyComponent/>
  <Footer/>
  {/* <CareerPage/> */}
  </>
}