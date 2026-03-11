import { ButtonItem, PanelSection, PanelSectionRow, Tabs, gamepadTabbedPageClasses, staticClasses } from '@decky/ui';
import { definePlugin } from '@decky/api';
import { useEffect, useRef, useState } from 'react';
import { FaMusic } from 'react-icons/fa';

import { PlayerProvider, usePlayer } from './context/PlayerContext';
import { NotConnectedView } from './components/NotConnectedView';
import { AuthTokenView } from './components/AuthTokenView';
import { PlayerView } from './components/PlayerView';
import { QueueView } from './components/QueueView';
import { SearchView } from './components/SearchView';

const getScrollParent = (el: HTMLElement | null): HTMLElement => {
  if (!el || el === document.body) return document.body;
  const style = window.getComputedStyle(el);
  if (/scroll|auto/.test(style.overflow + style.overflowY)) return el;
  return getScrollParent(el.parentElement);
};

const TAB_BAR_HEIGHT = 40;

const PluginContent = () => {
  const { connected, authRequired } = usePlayer();
  const [activeTab, setActiveTab] = useState<string>('player');
  const containerRef = useRef<HTMLDivElement>(null);
  const [stickyTop, setStickyTop] = useState(52);

  useEffect(() => {
    if (!containerRef.current) return;
    const scrollParent = getScrollParent(containerRef.current.parentElement);
    const parentRect = scrollParent.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();
    setStickyTop(Math.round(containerRect.top - parentRect.top));
  }, []);

  if (!connected) return <NotConnectedView />;
  if (authRequired) return <AuthTokenView />;

  const tabPad: React.CSSProperties = { paddingTop: `${TAB_BAR_HEIGHT}px` };

  if (!Tabs) {
    return (
      <>
        <PanelSection>
          {(['player', 'queue', 'search'] as const).map((id) => (
            <PanelSectionRow key={id}>
              <ButtonItem onClick={() => setActiveTab(id)}>
                {activeTab === id
                  ? `▶ ${id.charAt(0).toUpperCase() + id.slice(1)}`
                  : id.charAt(0).toUpperCase() + id.slice(1)}
              </ButtonItem>
            </PanelSectionRow>
          ))}
        </PanelSection>
        {activeTab === 'player' && <div style={tabPad}><PlayerView /></div>}
        {activeTab === 'queue' && <div style={tabPad}><QueueView /></div>}
        {activeTab === 'search' && <div style={tabPad}><SearchView /></div>}
      </>
    );
  }

  return (
    <div
      ref={containerRef}
      className="ytm-tabs-container"
      style={{ height: 'calc(100vh - 40px)', display: 'flex', flexDirection: 'column' }}
    >
      {gamepadTabbedPageClasses?.TabHeaderRowWrapper && (
        <style>{`
          .ytm-tabs-container .${gamepadTabbedPageClasses.TabHeaderRowWrapper} {
            position: sticky;
            top: ${stickyTop}px;
            z-index: 9999;
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(8px);
          }
        `}</style>
      )}
      <Tabs
        activeTab={activeTab}
        onShowTab={(tabID: string) => setActiveTab(tabID)}
        tabs={[
          { id: 'player', title: 'Player', content: <div style={tabPad}><PlayerView /></div> },
          { id: 'queue', title: 'Queue', content: <div style={tabPad}><QueueView /></div> },
          { id: 'search', title: 'Search', content: <div style={tabPad}><SearchView /></div> },
        ]}
      />
    </div>
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
