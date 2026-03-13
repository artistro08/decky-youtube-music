import { ButtonItem, Navigation } from '@decky/ui';
import { Section } from './Section';

export const AuthTokenView = () => {
  const handleOpenSettings = () => {
    Navigation.Navigate('/youtube-music/settings');
    Navigation.CloseSideMenus();
  };

  return (
    <Section title="Authentication Required">
      <div style={{ padding: '8px 16px', fontSize: '12px', color: 'var(--gpSystemLighterGrey)' }}>
        The YouTube Music API server requires authorization. Open Settings to authorize this plugin.
      </div>
      <ButtonItem layout="below" onClick={handleOpenSettings}>
        Open Settings
      </ButtonItem>
    </Section>
  );
};
