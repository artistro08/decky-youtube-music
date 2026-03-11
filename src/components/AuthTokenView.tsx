import { ButtonItem, PanelSection, PanelSectionRow, TextField } from '@decky/ui';
import { useState } from 'react';
import { setToken } from '../services/apiClient';
import { disconnect, resetAndConnect } from '../services/websocketService';

export const AuthTokenView = () => {
  const [token, setTokenInput] = useState('');

  const handleSave = () => {
    if (!token.trim()) return;
    setToken(token.trim());
    disconnect();
    setTimeout(resetAndConnect, 100);
  };

  return (
    <PanelSection title="Authentication Required">
      <PanelSectionRow>
        <div style={{ fontSize: '12px', marginBottom: '8px', color: 'var(--gpSystemLighterGrey)' }}>
          The YouTube Music API server requires a token. Find it in the API Server plugin settings.
        </div>
      </PanelSectionRow>
      <PanelSectionRow>
        <TextField
          label="API Token"
          value={token}
          onChange={(e) => setTokenInput(e.target.value)}
        />
      </PanelSectionRow>
      <PanelSectionRow>
        <ButtonItem layout="below" onClick={handleSave} disabled={!token.trim()}>
          Save & Connect
        </ButtonItem>
      </PanelSectionRow>
    </PanelSection>
  );
};
