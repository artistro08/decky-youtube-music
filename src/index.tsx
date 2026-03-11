import { ButtonItem, PanelSection, PanelSectionRow, staticClasses } from '@decky/ui';
import { definePlugin } from '@decky/api';
import { ReactElement, useState } from 'react';
import { FaMusic } from 'react-icons/fa';

import { PlayerProvider, usePlayer } from './context/PlayerContext';
import { NotConnectedView } from './components/NotConnectedView';
import { AuthTokenView } from './components/AuthTokenView';
import { PlayerView } from './components/PlayerView';
import { QueueView } from './components/QueueView';
import { SearchView } from './components/SearchView';

type TabId = 'player' | 'queue' | 'search';

const TABS: { id: TabId; title: string }[] = [
  { id: 'player', title: 'Player' },
  { id: 'queue', title: 'Queue' },
  { id: 'search', title: 'Search' },
];

const TAB_CONTENT: Record<TabId, ReactElement> = {
  player: <PlayerView />,
  queue: <QueueView />,
  search: <SearchView />,
};

const PluginContent = () => {
  const { connected, authRequired } = usePlayer();
  const [activeTab, setActiveTab] = useState<TabId>('player');

  if (!connected) return <NotConnectedView />;
  if (authRequired) return <AuthTokenView />;

  return (
    <>
      <PanelSection>
        <PanelSectionRow>
          <div style={{ display: 'flex', gap: '4px' }}>
            {TABS.map(({ id, title }) => (
              <div key={id} style={{ flex: 1, fontWeight: activeTab === id ? 'bold' : 'normal' }}>
                <ButtonItem
                  layout="below"
                  onClick={() => setActiveTab(id)}
                >
                  {title}
                </ButtonItem>
              </div>
            ))}
          </div>
        </PanelSectionRow>
      </PanelSection>
      {TAB_CONTENT[activeTab]}
    </>
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
