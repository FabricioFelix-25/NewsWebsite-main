import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import TermsModal from '../components/TermsModal';

type CookiePreferences = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  version: string;
  acceptedAt: string;
};

interface TermsContextType {
  hasCookieConsent: boolean;
  preferences: CookiePreferences | null;
  reopenCookiePreferences: () => void;
}

const TermsContext = createContext<TermsContextType | undefined>(undefined);

export const useTerms = () => {
  const context = useContext(TermsContext);
  if (!context) {
    throw new Error('useTerms must be used within a TermsProvider');
  }
  return context;
};

interface TermsProviderProps {
  children: ReactNode;
}

const COOKIE_CONSENT_KEY = 'alpes-news-cookie-consent';
const COOKIE_CONSENT_VERSION = '2026-04-29';

function buildPreferences(analytics: boolean, marketing: boolean): CookiePreferences {
  return {
    necessary: true,
    analytics,
    marketing,
    version: COOKIE_CONSENT_VERSION,
    acceptedAt: new Date().toISOString(),
  };
}

function readStoredPreferences(): CookiePreferences | null {
  const raw = localStorage.getItem(COOKIE_CONSENT_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as CookiePreferences;
    return parsed.version === COOKIE_CONSENT_VERSION ? parsed : null;
  } catch {
    return null;
  }
}

export const TermsProvider: React.FC<TermsProviderProps> = ({ children }) => {
  const [preferences, setPreferences] = useState<CookiePreferences | null>(() => readStoredPreferences());
  const [draftAnalytics, setDraftAnalytics] = useState(Boolean(preferences?.analytics));
  const [draftMarketing, setDraftMarketing] = useState(Boolean(preferences?.marketing));
  const [showModal, setShowModal] = useState(!preferences);

  useEffect(() => {
    if (!preferences) {
      setShowModal(true);
    }
  }, [preferences]);

  const persistPreferences = (nextPreferences: CookiePreferences) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(nextPreferences));
    setPreferences(nextPreferences);
    setDraftAnalytics(nextPreferences.analytics);
    setDraftMarketing(nextPreferences.marketing);
    setShowModal(false);
  };

  const acceptAll = () => {
    persistPreferences(buildPreferences(true, true));
  };

  const rejectOptional = () => {
    persistPreferences(buildPreferences(false, false));
  };

  const savePreferences = () => {
    persistPreferences(buildPreferences(draftAnalytics, draftMarketing));
  };

  const reopenCookiePreferences = () => {
    setDraftAnalytics(Boolean(preferences?.analytics));
    setDraftMarketing(Boolean(preferences?.marketing));
    setShowModal(true);
  };

  return (
    <TermsContext.Provider
      value={{
        hasCookieConsent: Boolean(preferences),
        preferences,
        reopenCookiePreferences,
      }}
    >
      {children}
      {showModal && (
        <TermsModal
          analyticsEnabled={draftAnalytics}
          marketingEnabled={draftMarketing}
          onToggleAnalytics={setDraftAnalytics}
          onToggleMarketing={setDraftMarketing}
          onAcceptAll={acceptAll}
          onRejectOptional={rejectOptional}
          onSavePreferences={savePreferences}
        />
      )}
    </TermsContext.Provider>
  );
};
