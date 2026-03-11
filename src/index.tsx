import { staticClasses } from '@decky/ui';
import { definePlugin } from '@decky/api';
import { FaMusic } from 'react-icons/fa';

import { PlayerProvider, usePlayer } from './context/PlayerContext';
import { NotConnectedView } from './components/NotConnectedView';
import { AuthTokenView } from './components/AuthTokenView';
import { PlayerView } from './components/PlayerView';
import { QueueView } from './components/QueueView';

const PluginContent = () => {
  const { connected, authRequired } = usePlayer();

  if (!connected) return <NotConnectedView />;
  if (authRequired) return <AuthTokenView />;

  return (
    <>
      <PlayerView />
      <QueueView />
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
