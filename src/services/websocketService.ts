import type { PlayerState, WSMessage, WSMessageType } from '../types';
import { getToken } from './apiClient';

const WS_URL = 'ws://localhost:26538/api/v1/ws';
const RECONNECT_DELAY_MS = 5000;

type StateListener = (state: Partial<PlayerState>) => void;

let socket: WebSocket | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let listeners: StateListener[] = [];
let destroyed = false;

export const addStateListener = (fn: StateListener): (() => void) => {
  listeners.push(fn);
  return () => { listeners = listeners.filter((l) => l !== fn); };
};

const notify = (state: Partial<PlayerState>) =>
  listeners.forEach((l) => l(state));

const buildUrl = (): string => {
  const token = getToken();
  return token ? `${WS_URL}?token=${encodeURIComponent(token)}` : WS_URL;
};

export const connect = (): void => {
  if (destroyed) return;
  if (socket && socket.readyState === WebSocket.OPEN) return;

  socket = new WebSocket(buildUrl());

  socket.onopen = () => {
    if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null; }
    notify({ connected: true, authRequired: false });
  };

  socket.onmessage = (event: MessageEvent) => {
    try {
      const msg = JSON.parse(event.data as string) as WSMessage;
      handleMessage(msg);
    } catch {
      // ignore malformed messages
    }
  };

  socket.onclose = () => {
    notify({ connected: false });
    if (!destroyed) {
      reconnectTimer = setTimeout(connect, RECONNECT_DELAY_MS);
    }
  };

  socket.onerror = () => {
    socket?.close();
  };
};

export const disconnect = (): void => {
  destroyed = true;
  if (reconnectTimer) clearTimeout(reconnectTimer);
  socket?.close();
  socket = null;
};

export const resetAndConnect = (): void => {
  destroyed = false;
  connect();
};

const handleMessage = (msg: WSMessage): void => {
  const type = msg.type as WSMessageType;

  switch (type) {
    case 'PLAYER_INFO':
      notify({
        song: msg.song,
        isPlaying: msg.isPlaying ?? false,
        muted: msg.muted ?? false,
        position: msg.position ?? 0,
        volume: msg.volume ?? 100,
        repeat: msg.repeat ?? 'NONE',
        shuffle: msg.shuffle ?? false,
        connected: true,
        authRequired: false,
      });
      break;
    case 'VIDEO_CHANGED':
      notify({ song: msg.song, position: 0 });
      break;
    case 'PLAYER_STATE_CHANGED':
      notify({ isPlaying: msg.isPlaying ?? false, position: msg.position ?? 0 });
      break;
    case 'POSITION_CHANGED':
      notify({ position: msg.position ?? 0 });
      break;
    case 'VOLUME_CHANGED':
      notify({ volume: msg.volume ?? 100, muted: msg.muted ?? false });
      break;
    case 'REPEAT_CHANGED':
      notify({ repeat: msg.repeat ?? 'NONE' });
      break;
    case 'SHUFFLE_CHANGED':
      notify({ shuffle: msg.shuffle ?? false });
      break;
  }
};
