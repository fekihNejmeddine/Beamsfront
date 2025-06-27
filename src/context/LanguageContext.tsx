import React, { createContext, useState, useEffect, ReactNode } from "react";

type LanguageContextType = {
  language: string;
  setLanguage: (lang: string) => void;
  isRTL: boolean;
};

export const LanguageContext = createContext<LanguageContextType>({
  language: "fr",
  setLanguage: () => {},
  isRTL: false,
});

type LanguageProviderProps = {
  children: ReactNode;
};

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  const [language, setLanguage] = useState<string>(
    localStorage.getItem("I18N_LANGUAGE") || "fr"
  );
  const [isRTL, setIsRTL] = useState<boolean>(language === "ar");

  useEffect(() => {
    localStorage.setItem("I18N_LANGUAGE", language);
    const newIsRTL = language === "ar";
    setIsRTL(newIsRTL);
    document.documentElement.dir = newIsRTL ? "rtl" : "ltr";
    document.documentElement.lang = language;
  }, [language]);
  

  return (
    <LanguageContext.Provider value={{ language, setLanguage, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
};