import { ButtonItem, PanelSection, PanelSectionRow, TextField } from '@decky/ui';
import { useState } from 'react';
import { getToken, setToken, clearToken, requestAuth } from '../services/apiClient';
import { disconnect, resetAndConnect } from '../services/websocketService';

const CLIENT_ID = 'decky-youtube-music';

type AuthState = 'idle' | 'pending' | 'success' | 'denied' | 'timeout' | 'error';

const AUTH_LABEL: Record<AuthState, string> = {
  idle: 'Request Authorization',
  pending: 'Waiting for approval...',
  success: 'Authorized!',
  denied: 'Denied — try again',
  timeout: 'Timed out — try again',
  error: 'Could not reach YouTube Music',
};

export const SettingsView = () => {
  const [authState, setAuthState] = useState<AuthState>('idle');
  const [manualToken, setManualToken] = useState('');
  const [hasToken, setHasToken] = useState(() => !!getToken());

  const reconnect = (token: string) => {
    setToken(token);
    disconnect();
    setTimeout(resetAndConnect, 100);
  };

  const handleRequestAuth = async () => {
    setAuthState('pending');
    try {
      const token = await requestAuth(CLIENT_ID);
      reconnect(token);
      setHasToken(true);
      setAuthState('success');
      setTimeout(() => setAuthState('idle'), 2000);
    } catch (e: unknown) {
      if (e instanceof Error && e.name === 'AbortError') {
        setAuthState('timeout');
      } else if (e instanceof Error && e.message === 'denied') {
        setAuthState('denied');
      } else {
        setAuthState('error');
      }
    }
  };

  const handleSaveManual = () => {
    const trimmed = manualToken.trim();
    if (!trimmed) return;
    reconnect(trimmed);
    setManualToken('');
    setHasToken(true);
  };

  const handleClear = () => {
    clearToken();
    disconnect();
    setTimeout(resetAndConnect, 100);
    setHasToken(false);
    setAuthState('idle');
  };

  return (
    <>
      <PanelSection title="Connection">
        <PanelSectionRow>
          <div style={{ fontSize: '13px' }}>
            {hasToken
              ? <span><span style={{ color: '#4caf50' }}>●</span> Token saved</span>
              : <span style={{ color: 'var(--gpSystemLighterGrey)' }}>✗ No token</span>}
          </div>
        </PanelSectionRow>
      </PanelSection>

      <PanelSection title="Authorization">
        <PanelSectionRow>
          <div style={{ fontSize: '12px', color: 'var(--gpSystemLighterGrey)' }}>
            Asks YouTube Music desktop to approve this plugin. Check your desktop app when prompted.
          </div>
        </PanelSectionRow>
        <PanelSectionRow>
          <ButtonItem
            layout="below"
            onClick={() => { void handleRequestAuth(); }}
            disabled={authState === 'pending'}
          >
            {AUTH_LABEL[authState]}
          </ButtonItem>
        </PanelSectionRow>

        <PanelSectionRow>
          <div style={{ fontSize: '12px', color: 'var(--gpSystemLighterGrey)', textAlign: 'center', margin: '4px 0' }}>
            — or enter token manually —
          </div>
        </PanelSectionRow>

        <PanelSectionRow>
          <TextField
            label="API Token"
            value={manualToken}
            onChange={(e) => setManualToken(e.target.value)}
          />
        </PanelSectionRow>
        <PanelSectionRow>
          <ButtonItem layout="below" onClick={handleSaveManual} disabled={!manualToken.trim()}>
            Save Token
          </ButtonItem>
        </PanelSectionRow>

        {hasToken && (
          <PanelSectionRow>
            <ButtonItem layout="below" onClick={handleClear}>
              Clear Token
            </ButtonItem>
          </PanelSectionRow>
        )}
      </PanelSection>
    </>
  );
};
