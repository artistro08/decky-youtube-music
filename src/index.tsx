import { PanelSection, PanelSectionRow, staticClasses } from '@decky/ui';
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
          <div style={{ display: 'flex', gap: '4px', width: '100%' }}>
            {TABS.map(({ id, title }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                style={{
                  flex: 1,
                  padding: '6px 4px',
                  background: activeTab === id ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)',
                  border: 'none',
                  borderRadius: '4px',
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: activeTab === id ? 'bold' : 'normal',
                  cursor: 'pointer',
                }}
              >
                {title}
              </button>
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
