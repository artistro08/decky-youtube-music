import { createContext, useContext, useEffect, useReducer, type FC, type ReactNode } from 'react';
import type { PlayerState } from '../types';
import { getSongInfo } from '../services/apiClient';
import { addStateListener, addAuthListener, disconnect, resetAndConnect } from '../services/websocketService';

const defaultState: PlayerState = {
  song: undefined,
  isPlaying: false,
  muted: false,
  position: 0,
  volume: 100,
  repeat: 'NONE',
  shuffle: false,
  connected: false,
  authRequired: false,
};

type Action = { type: 'UPDATE'; payload: Partial<PlayerState> };

const reducer = (state: PlayerState, action: Action): PlayerState => {
  if (action.type === 'UPDATE') return { ...state, ...action.payload };
  return state;
};

const PlayerContext = createContext<PlayerState>(defaultState);

export const PlayerProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, defaultState);

  useEffect(() => {
    resetAndConnect();
    const removeState = addStateListener((partial) =>
      dispatch({ type: 'UPDATE', payload: partial }),
    );
    const removeAuth = addAuthListener(() =>
      dispatch({ type: 'UPDATE', payload: { authRequired: true } }),
    );
    return () => {
      removeState();
      removeAuth();
      disconnect();
    };
  }, []);

  // Supplement WebSocket song data with HTTP response when the song changes.
  // The WS payload often omits albumArt; GET /api/v1/song always includes it.
  useEffect(() => {
    if (!state.connected) return;
    let cancelled = false;
    void getSongInfo().then((info) => {
      if (!cancelled && info) dispatch({ type: 'UPDATE', payload: { song: info } });
    });
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps -- dispatch is stable; intentionally omit to avoid extra fetches
  }, [state.song?.videoId, state.connected]);

  return <PlayerContext.Provider value={state}>{children}</PlayerContext.Provider>;
};

export const usePlayer = (): PlayerState => useContext(PlayerContext);
