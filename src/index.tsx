import { staticClasses } from '@decky/ui';
import { definePlugin } from '@decky/api';
import { FaMusic } from 'react-icons/fa';

import { PlayerProvider, usePlayer } from './context/PlayerContext';
import { NotConnectedView } from './components/NotConnectedView';
import { AuthTokenView } from './components/AuthTokenView';
import { MainView } from './components/MainView';

const PluginContent = () => {
  const { connected, authRequired } = usePlayer();

  if (!connected) return <NotConnectedView />;
  if (authRequired) return <AuthTokenView />;

  return <MainView />;
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
