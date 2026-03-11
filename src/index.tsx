import { ButtonItem, Tabs, gamepadTabbedPageClasses, staticClasses } from '@decky/ui';
import { definePlugin } from '@decky/api';
import { useEffect, useRef, useState } from 'react';
import { FaMusic } from 'react-icons/fa';

import { PlayerProvider, usePlayer } from './context/PlayerContext';
import { NotConnectedView } from './components/NotConnectedView';
import { AuthTokenView } from './components/AuthTokenView';
import { PlayerView } from './components/PlayerView';
import { QueueView } from './components/QueueView';
import { SearchView } from './components/SearchView';
import { Section } from './components/Section';

const getScrollParent = (el: HTMLElement | null): HTMLElement => {
  if (!el || el === document.body) return document.body;
  const style = window.getComputedStyle(el);
  if (/scroll|auto/.test(style.overflow + style.overflowY)) return el;
  return getScrollParent(el.parentElement);
};

const TAB_BAR_HEIGHT = 40;
const TAB_PAD: React.CSSProperties = { paddingTop: `${TAB_BAR_HEIGHT}px` };

const PluginContent = () => {
  const { connected, authRequired } = usePlayer();
  const [activeTab, setActiveTab] = useState<string>('player');
  const containerRef = useRef<HTMLDivElement>(null);
  // 52px: estimated fallback (plugin title bar height) if layout hasn't measured yet
  const [stickyTop, setStickyTop] = useState(52);

  useEffect(() => {
    if (!containerRef.current) return;
    const scrollParent = getScrollParent(containerRef.current);
    const parentRect = scrollParent.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();
    setStickyTop(Math.round(containerRect.top - parentRect.top));
  }, []);

  if (!connected) return <NotConnectedView />;
  if (authRequired) return <AuthTokenView />;

  if (!Tabs) {
    return (
      <>
        <Section>
          {(['player', 'queue', 'search'] as const).map((id) => (
            <ButtonItem key={id} onClick={() => setActiveTab(id)}>
              {activeTab === id
                ? `▶ ${id.charAt(0).toUpperCase() + id.slice(1)}`
                : id.charAt(0).toUpperCase() + id.slice(1)}
            </ButtonItem>
          ))}
        </Section>
        {activeTab === 'player' && <PlayerView />}
        {activeTab === 'queue' && <QueueView />}
        {activeTab === 'search' && <SearchView />}
      </>
    );
  }

  return (
    <div
      ref={containerRef}
      className="ytm-tabs-container"
      style={{ height: 'calc(100vh - 40px)', display: 'flex', flexDirection: 'column' }}
    >
      <style>{[
        gamepadTabbedPageClasses?.TabHeaderRowWrapper && `
          .ytm-tabs-container .${gamepadTabbedPageClasses.TabHeaderRowWrapper} {
            position: sticky;
            top: ${stickyTop}px;
            z-index: 9999;
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(8px);
          }
        `,
        staticClasses?.TabContentColumn && `
          .ytm-tabs-container .${staticClasses.TabContentColumn} {
            padding-left: 0 !important;
            padding-right: 0 !important;
          }
        `,
      ].filter(Boolean).join('')}</style>
      <Tabs
        activeTab={activeTab}
        onShowTab={(tabID: string) => setActiveTab(tabID)}
        tabs={[
          { id: 'player', title: 'Player', content: <div style={TAB_PAD}><PlayerView /></div> },
          { id: 'queue', title: 'Queue', content: <div style={TAB_PAD}><QueueView /></div> },
          { id: 'search', title: 'Search', content: <div style={TAB_PAD}><SearchView /></div> },
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
