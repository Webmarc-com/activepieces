import React, { createContext, useContext, useState } from 'react';

import { cn } from '@/lib/utils';

type EmbeddingState = {
  isEmbedded: boolean;
  hideSideNav: boolean;
  hideFlowsPageNavbar: boolean;
  disableNavigationInBuilder: boolean;
  hideFolders: boolean;
  hideFlowNameInBuilder: boolean;
  hideExportAndImportFlow: boolean;
  sdkVersion?: string;
  predefinedConnectionName?: string;
  fontUrl?: string;
  fontFamily?: string;
  useDarkBackground: boolean;
  hideHomeButtonInBuilder: boolean;
  emitHomeButtonClickedEvent: boolean;
  homeButtonIcon: 'back' | 'logo';
  hideDuplicateFlow: boolean;
  hidePageHeader: boolean;
};

// Check if hideSidebar param is in URL or was set previously in session
const EMBED_HIDE_SIDEBAR_KEY = 'embed_hide_sidebar';
function checkEmbedModeFromUrl(): boolean {
  const urlParams = new URLSearchParams(window.location.search);
  const hideSidebar = urlParams.get('hideSidebar') === 'true';

  if (hideSidebar) {
    // Store in sessionStorage for subsequent navigations
    sessionStorage.setItem(EMBED_HIDE_SIDEBAR_KEY, 'true');
    return true;
  }

  // Check if it was set previously (for navigation within the app)
  return sessionStorage.getItem(EMBED_HIDE_SIDEBAR_KEY) === 'true';
}

// Check if we're inside an iframe
function isInIframe(): boolean {
  try {
    return window.self !== window.top;
  } catch (e) {
    // If we can't access window.top due to cross-origin, we're in an iframe
    return true;
  }
}

// Enable embed mode if hideSidebar param is set OR if we're in an iframe with the param stored
const isEmbedFromUrl = checkEmbedModeFromUrl() || (isInIframe() && sessionStorage.getItem(EMBED_HIDE_SIDEBAR_KEY) === 'true');

const defaultState: EmbeddingState = {
  isEmbedded: isEmbedFromUrl,
  hideSideNav: isEmbedFromUrl,
  hideFlowsPageNavbar: isEmbedFromUrl,
  disableNavigationInBuilder: false,
  hideFolders: isEmbedFromUrl,
  hideFlowNameInBuilder: false,
  hideExportAndImportFlow: false,
  useDarkBackground: window.opener !== null,
  hideHomeButtonInBuilder: isEmbedFromUrl,
  emitHomeButtonClickedEvent: false,
  homeButtonIcon: 'logo',
  hideDuplicateFlow: false,
  hidePageHeader: isEmbedFromUrl,
};

const EmbeddingContext = createContext<{
  embedState: EmbeddingState;
  setEmbedState: React.Dispatch<React.SetStateAction<EmbeddingState>>;
}>({
  embedState: defaultState,
  setEmbedState: () => {},
});

export const useEmbedding = () => useContext(EmbeddingContext);

type EmbeddingProviderProps = {
  children: React.ReactNode;
};

const EmbeddingProvider = ({ children }: EmbeddingProviderProps) => {
  const [state, setState] = useState<EmbeddingState>(defaultState);

  return (
    <EmbeddingContext.Provider
      value={{ embedState: state, setEmbedState: setState }}
    >
      <div
        className={cn({
          'bg-black/80 h-screen w-screen':
            state.useDarkBackground && state.isEmbedded,
        })}
      >
        {children}
      </div>
    </EmbeddingContext.Provider>
  );
};

EmbeddingProvider.displayName = 'EmbeddingProvider';

export { EmbeddingProvider };
