import { ButtonItem, Tabs, staticClasses } from '@decky/ui';
import { definePlugin } from '@decky/api';
import { useEffect, useRef, useState } from 'react';
import { FaMusic } from 'react-icons/fa';

import { PlayerProvider, usePlayer } from './context/PlayerContext';
import { NotConnectedView } from './components/NotConnectedView';
import { AuthTokenView } from './components/AuthTokenView';
import { PlayerView } from './components/PlayerView';
import { QueueView } from './components/QueueView';
import { Section } from './components/Section';

const TabsContainer = () => {
  const [activeTab, setActiveTab] = useState<string>('player');
  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number>(500);

  // Height measurement — run once on mount.
  useEffect(() => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();

    let el: Element | null = containerRef.current.parentElement;
    while (el && el !== document.documentElement) {
      const style = window.getComputedStyle(el);
      const oy = style.overflowY;
      if (oy === 'scroll' || oy === 'auto' || oy === 'overlay') {
        const elRect = el.getBoundingClientRect();
        setHeight(elRect.bottom - containerRect.top);
        return;
      }
      el = el.parentElement;
    }
    setHeight(window.innerHeight - containerRect.top);
  }, []);

  // Adjust Decky Tabs layout on mount and every tab switch.
  useEffect(() => {
    // Zero the content scroll container's injected left/right padding.
    document.querySelectorAll<HTMLElement>('[class*="TabContentsScroll"]').forEach((el) => {
      el.style.paddingLeft = '0';
      el.style.paddingRight = '0';
    });

    // Shrink the tab bar row height.
    document.querySelectorAll<HTMLElement>('[class*="TabHeaderRowWrapper"]').forEach((el) => {
      el.style.minHeight = '32px';
    });

    // Scale down the L1/R1 glyph icons.
    document.querySelectorAll<HTMLElement>('[class*="Glyphs"]').forEach((el) => {
      el.style.transform = 'scale(0.65)';
      el.style.transformOrigin = 'center center';
    });
  }, [activeTab]);

  return (
    <div ref={containerRef} style={{ height }}>
      <Tabs
        activeTab={activeTab}
        onShowTab={(tabID: string) => setActiveTab(tabID)}
        tabs={[
          { id: 'player', title: 'Player', content: <PlayerView /> },
          { id: 'queue', title: 'Queue', content: <QueueView /> },
        ]}
      />
    </div>
  );
};

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

  return <TabsContainer />;
};

const Content = () => {
  useEffect(() => {
    const titleEl = document.querySelector(`.${staticClasses.Title}`);
    if (titleEl?.parentElement) {
      titleEl.parentElement.style.gap = '0';
    }
  }, []);
  return (
    <PlayerProvider>
      <PluginContent />
    </PlayerProvider>
  );
};

export default definePlugin(() => ({
  name: 'YouTube Music',
  titleView: <div className={staticClasses.Title} style={{ paddingTop: '0', boxShadow: 'none' }}>YouTube Music</div>,
  content: <Content />,
  icon: <FaMusic />,
  onDismount() {},
}));
