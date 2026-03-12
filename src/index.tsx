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

  // Zero the Decky Tabs content scroll container padding.
  // The _TabContentsScroll element has 2.8vw left/right padding injected by
  // Decky's CSS. It renders outside our containerRef DOM subtree (portal), so
  // we query the document directly using its stable class name fragment.
  // Runs on mount and on every tab switch in case the element is recreated.
  useEffect(() => {
    document.querySelectorAll<HTMLElement>('[class*="TabContentsScroll"]').forEach((el) => {
      el.style.paddingLeft = '0';
      el.style.paddingRight = '0';
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
