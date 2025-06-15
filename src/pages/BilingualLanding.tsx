
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import LandingPage from './LandingPage';

const BilingualLanding = () => {
  const { language } = useLanguage();
  
  // For now, we'll use the enhanced LandingPage component for both languages
  // This can be extended later to support multiple languages
  return <LandingPage />;
};

export default BilingualLanding;
