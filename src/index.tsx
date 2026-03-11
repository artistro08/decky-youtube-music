import { Tabs, staticClasses } from '@decky/ui';
import { definePlugin } from '@decky/api';
import { useState } from 'react';
import { FaMusic } from 'react-icons/fa';

import { PlayerProvider, usePlayer } from './context/PlayerContext';
import { NotConnectedView } from './components/NotConnectedView';
import { AuthTokenView } from './components/AuthTokenView';
import { PlayerView } from './components/PlayerView';
import { QueueView } from './components/QueueView';
import { SearchView } from './components/SearchView';

const PluginContent = () => {
  const { connected, authRequired } = usePlayer();
  const [activeTab, setActiveTab] = useState<string>('player');

  if (!connected) return <NotConnectedView />;
  if (authRequired) return <AuthTokenView />;

  return (
    <Tabs
      activeTab={activeTab}
      onShowTab={(tabID: string) => setActiveTab(tabID)}
      tabs={[
        { id: 'player', title: 'Player', content: <PlayerView /> },
        { id: 'queue', title: 'Queue', content: <QueueView /> },
        { id: 'search', title: 'Search', content: <SearchView /> },
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
