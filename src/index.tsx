import { ButtonItem, Tabs, staticClasses } from '@decky/ui';
import { definePlugin } from '@decky/api';
import { useState } from 'react';
import { FaMusic } from 'react-icons/fa';

import { PlayerProvider, usePlayer } from './context/PlayerContext';
import { NotConnectedView } from './components/NotConnectedView';
import { AuthTokenView } from './components/AuthTokenView';
import { PlayerView } from './components/PlayerView';
import { QueueView } from './components/QueueView';
import { Section } from './components/Section';

const PluginContent = () => {
  const { connected, authRequired } = usePlayer();
  const [activeTab, setActiveTab] = useState<string>('player');

  if (!connected) return <NotConnectedView />;
  if (authRequired) return <AuthTokenView />;

  if (!Tabs) {
    return (
      <>
        <Section>
          {(['player', 'queue'] as const).map((id) => (
            <ButtonItem key={id} onClick={() => setActiveTab(id)}>
              {activeTab === id
                ? `▶ ${id.charAt(0).toUpperCase() + id.slice(1)}`
                : id.charAt(0).toUpperCase() + id.slice(1)}
            </ButtonItem>
          ))}
        </Section>
        {activeTab === 'player' && <PlayerView />}
        {activeTab === 'queue' && <QueueView />}
      </>
    );
  }

  return (
    <Tabs
      activeTab={activeTab}
      onShowTab={(tabID: string) => setActiveTab(tabID)}
      tabs={[
        { id: 'player', title: 'Player', content: <PlayerView /> },
        { id: 'queue', title: 'Queue', content: <QueueView /> },
      ]}
    />
  );
};

const Content = () => (
  <PlayerProvider>
    <PluginContent />
  </PlayerProvider>
);

export default definePlugin(() => ({
  name: 'YouTube Music',
  titleView: <div className={staticClasses.Title}>YouTube Music</div>,
  content: <Content />,
  icon: <FaMusic />,
  onDismount() {},
}));
