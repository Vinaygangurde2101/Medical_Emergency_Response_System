import React, { createContext, useState, useContext } from 'react';

const translations = {
  en: {
    dashboard: "Dashboard",
    profile: "My Profile",
    qrCode: "My QR Code",
    emergency: "Emergency Settings",
    logout: "Logout",
    bloodGroup: "Blood Group",
    allergies: "Allergies",
    medications: "Medications",
    emergencyMode: "EMERGENCY MODE",
    welcome: "Welcome",
    createId: "Create Your ID",
    saveLives: "Save lives in seconds.",
    howItWorks: "How It Works",
    reportAnalyzer: "Report Analyzer",
    uploadReport: "Upload Medical Report",
    analyzing: "Analyzing...",
    analyzeBtn: "Analyze Report",
    summary: "Summary",
    keyFindings: "Key Findings",
    recommendations: "Recommendations"
  },
  hi: {
    dashboard: "डैशबोर्ड",
    profile: "मेरी प्रोफ़ाइल",
    qrCode: "मेरा क्यूआर कोड",
    emergency: "आपातकालीन सेटिंग्स",
    logout: "लॉग आउट",
    bloodGroup: "रक्त समूह",
    allergies: "एलर्जी",
    medications: "दवाएं",
    emergencyMode: "आपातकालीन मोड",
    welcome: "स्वागत है",
    createId: "अपनी आईडी बनाएं",
    saveLives: "सेकंड में जान बचाएं।",
    howItWorks: "यह कैसे काम करता है",
    reportAnalyzer: "रिपोर्ट विश्लेषक",
    uploadReport: "मेडिकल रिपोर्ट अपलोड करें",
    analyzing: "विश्लेषण किया जा रहा है...",
    analyzeBtn: "रिपोर्ट का विश्लेषण करें",
    summary: "सारांश",
    keyFindings: "मुख्य निष्कर्ष",
    recommendations: "सुझाव"
  },
  mr: {
    dashboard: "डॅशबोर्ड",
    profile: "माझी प्रोफाइल",
    qrCode: "माझा क्यूआर कोड",
    emergency: "आणीबाणी सेटिंग्ज",
    logout: "लॉग आउट",
    bloodGroup: "रक्त गट",
    allergies: "अॅलर्जी",
    medications: "औषधे",
    emergencyMode: "आणीबाणी मोड",
    welcome: "स्वागत आहे",
    createId: "तुमची आयडी तयार करा",
    saveLives: "सेकंदात जीव वाचवा.",
    howItWorks: "हे कसे कार्य करते",
    reportAnalyzer: "अहवाल विश्लेषक",
    uploadReport: "वैद्यकीय अहवाल अपलोड करा",
    analyzing: "विश्लेषण करत आहे...",
    analyzeBtn: "अहवालाचे विश्लेषण करा",
    summary: "सारांश",
    keyFindings: "मुख्य निष्कर्ष",
    recommendations: "शिफारसी"
  },
  gu: {
    dashboard: "ડેશબોર્ડ",
    profile: "મારી પ્રોફાઇલ",
    qrCode: "મારો ક્યુઆર કોડ",
    emergency: "કટોકટી સેટિંગ્સ",
    logout: "લોગઆઉટ",
    bloodGroup: "બ્લડ ગ્રુપ",
    allergies: "એલર્જી",
    medications: "દવાઓ",
    emergencyMode: "કટોકટી મોડ",
    welcome: "સ્વાગત છે",
    createId: "તમારી આઈડી બનાવો",
    saveLives: "સેકંડમાં જીવ બચાવો.",
    howItWorks: "તે કેવી રીતે કાર્ય કરે છે",
    reportAnalyzer: "રિપોર્ટ વિશ્લેષક",
    uploadReport: "મેડિકલ રિપોર્ટ અપલોડ કરો",
    analyzing: "વિશ્લેષણ કરી રહ્યું છે...",
    analyzeBtn: "રિપોર્ટનું વિશ્લેષણ કરો",
    summary: "સારાંશ",
    keyFindings: "મુખ્ય તારણો",
    recommendations: "ભલામણો"
  }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState('en');

  const t = (key) => translations[lang]?.[key] || translations['en'][key] || key;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => useContext(LanguageContext);
