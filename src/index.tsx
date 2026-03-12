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

  useEffect(() => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();

    // Walk up to find the scroll container for height measurement.
    let el: Element | null = containerRef.current.parentElement;
    while (el && el !== document.documentElement) {
      const style = window.getComputedStyle(el);
      const oy = style.overflowY;
      if (oy === 'scroll' || oy === 'auto' || oy === 'overlay') {
        const elRect = el.getBoundingClientRect();
        setHeight(elRect.bottom - containerRect.top);
        break;
      }
      el = el.parentElement;
    }

    // Fallback height if no scrollable ancestor found
    if (!el || el === document.documentElement) {
      setHeight(window.innerHeight - containerRect.top);
    }

    // Walk up to find the Tabs content column and zero its padding.
    // Decky's TabContentColumn injects left/right padding that creates
    // an unwanted edge gap. We zero it here to allow full-width content.
    let padEl: HTMLElement | null = containerRef.current.parentElement as HTMLElement | null;
    while (padEl && padEl !== document.documentElement) {
      const style = window.getComputedStyle(padEl);
      const pl = parseFloat(style.paddingLeft);
      const pr = parseFloat(style.paddingRight);
      if (pl > 0 || pr > 0) {
        padEl.style.paddingLeft = '0px';
        padEl.style.paddingRight = '0px';
        break;
      }
      padEl = padEl.parentElement as HTMLElement | null;
    }
  }, []);

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
