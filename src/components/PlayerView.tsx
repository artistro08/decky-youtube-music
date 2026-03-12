import { ButtonItem, DialogButton, Focusable, SliderField, ToggleField } from '@decky/ui';
import type { SliderFieldProps } from '@decky/ui';
import { useEffect, useRef, useState } from 'react';
import { usePlayer } from '../context/PlayerContext';
import {
  dislike,
  getVolume,
  like,
  next,
  previous,
  seekTo,
  setVolume,
  shuffle,
  switchRepeat,
  toggleMute,
  togglePlay,
} from '../services/apiClient';
import { Section } from './Section';

const REPEAT_LABELS: Record<string, string> = {
  NONE: 'Repeat: Off',
  ALL: 'Repeat: All',
  ONE: 'Repeat: One',
};
const REPEAT_NEXT: Record<string, number> = { NONE: 1, ALL: 1, ONE: 1 };

const rowBtnFirst: React.CSSProperties = {
  marginLeft: '0px',
  height: '30px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: '0',
  flex: 1,
};

const rowBtn: React.CSSProperties = {
  marginLeft: '5px',
  height: '30px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: '0',
  flex: 1,
};

// Wraps a SliderField in a 12px-padded container and removes Decky's
// hardcoded min-width (270px) by finding the offending element at mount.
const applyInnerPadding = (el: HTMLElement) => {
  el.style.paddingLeft = '12px';
  el.style.paddingRight = '12px';
};

const PaddedButton = (props: React.ComponentProps<typeof ButtonItem>) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const first = ref.current?.firstElementChild as HTMLElement | null;
    if (first) applyInnerPadding(first);
  }, []);
  return <div ref={ref}><ButtonItem {...props} /></div>;
};

const PaddedToggle = (props: React.ComponentProps<typeof ToggleField>) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const first = ref.current?.firstElementChild as HTMLElement | null;
    if (first) applyInnerPadding(first);
  }, []);
  return <div ref={ref}><ToggleField {...props} /></div>;
};

const PaddedSlider = (props: SliderFieldProps) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const firstChild = ref.current.firstElementChild as HTMLElement | null;
    if (firstChild) {
      firstChild.style.paddingLeft = '10px';
      firstChild.style.paddingRight = '10px';
    }
    ref.current.querySelectorAll<HTMLElement>('*').forEach((el) => {
      if (parseFloat(window.getComputedStyle(el).minWidth) >= 270)
        el.style.minWidth = '0';
    });
  }, []);
  return (
    <div ref={ref}>
      <SliderField {...props} />
    </div>
  );
};

// Module-level cache — survives PlayerView unmount/remount when the user
// switches tabs, so the slider restores the last known value rather than
// whatever the context (potentially stale) reports at remount time.
let _cachedVolume: number | null = null;
let _cachedMuted: boolean | null = null;

export const PlayerView = () => {
  const { song, isPlaying, volume, muted, shuffle: isShuffled, repeat, position, connected } = usePlayer();

  // Local display state for the volume slider.
  // Problems solved:
  //   1. Touch drag fires onChange rapidly; multiple API calls come back via WebSocket
  //      out of order and snap the slider to stale values mid-drag.
  //   2. D-pad presses jump because WebSocket resets displayVolume between presses.
  //   3. muted from context forced value=0, making every d-pad press compute from 0
  //      so the slider could never increase beyond 1 step.
  //   4. 500ms cooldown was shorter than the API round-trip, letting stale WebSocket
  //      events snap the slider back after the cooldown expired.
  //   5. PLAYER_INFO messages with undefined volume defaulted to 100, corrupting
  //      context on tab switch. Fixed in websocketService + cached here as backup.
  //
  // Fix: block WebSocket syncs while adjusting (+ 1500ms cooldown after last change),
  // always pass displayVolume (not muted?0) as the slider value so d-pad computes
  // from the real level, and track displayMuted locally so the label/button stay
  // correct without letting the WebSocket muted field interfere with the slider.
  const [displayVolume, setDisplayVolume] = useState(() => _cachedVolume ?? volume);
  const [displayMuted, setDisplayMuted] = useState(() => _cachedMuted ?? muted);
  const adjustingRef = useRef(false);
  const cooldownTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // The WebSocket `volume` field is unreliable for display — it appears to come
  // from a different source/scale than the 0-100 value the API accepts and the
  // app displays (e.g. the user sets 55, app shows 55, WebSocket reports 24).
  // Syncing displayVolume from the WebSocket would corrupt the slider.
  //
  // Fetch the real volume via HTTP whenever connected. This covers both first
  // load (no cached value) and reconnections after YouTube Music restarts
  // (where _cachedVolume from the previous session would otherwise be stale).
  useEffect(() => {
    if (!connected) return;
    void getVolume().then((res) => {
      if (res !== null && !adjustingRef.current) {
        _cachedVolume = res.state;
        setDisplayVolume(res.state);
      }
    });
  }, [connected]);

  // muted is a simple boolean — keep it in sync with context (no scale issue).
  useEffect(() => {
    if (!adjustingRef.current) { _cachedMuted = muted; setDisplayMuted(muted); }
  }, [muted]);

  // Cleanup timers on unmount.
  useEffect(() => () => {
    if (cooldownTimer.current) clearTimeout(cooldownTimer.current);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
  }, []);

  const handleVolumeChange = (val: number) => {
    adjustingRef.current = true;
    _cachedVolume = val;
    setDisplayVolume(val);

    // Keep adjustingRef true for 1500ms so the muted WebSocket sync and the
    // mount-time getVolume() fetch don't overwrite the user's in-flight value.
    if (cooldownTimer.current) clearTimeout(cooldownTimer.current);
    cooldownTimer.current = setTimeout(() => { adjustingRef.current = false; }, 1500);

    // Debounce the API call — only fire after 300ms of no further changes.
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => { void setVolume(val); }, 300);
  };

  const albumArt = song?.albumArt;
  const title = song?.title ?? 'Nothing playing';
  const artist = song?.artist ?? '';
  const duration = song?.songDuration ?? 0;

  return (
    <>
      {/* Album art */}
      {albumArt && (
        <Section>
          <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0' }}>
            <img
              src={albumArt}
              alt="Album art"
              style={{ width: '100%', maxWidth: '180px', borderRadius: '8px' }}
            />
          </div>
        </Section>
      )}

      {/* Track info */}
      <Section>
        <div style={{ textAlign: 'center', padding: '8px 0' }}>
          <div style={{ fontWeight: 'bold', fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {title}
          </div>
          {artist && (
            <div style={{ fontSize: '11px', color: 'var(--gpSystemLighterGrey)', marginTop: '2px' }}>
              {artist}
            </div>
          )}
        </div>
        {duration > 0 && (
          <PaddedSlider
            label=""
            value={position}
            min={0}
            max={duration}
            step={1}
            onChange={(val) => { void seekTo(val); }}
            showValue={false}
          />
        )}
      </Section>

      {/* Prev / Play / Next */}
      <Section title="Controls" noPull>
        {DialogButton ? (
          <>
            <Focusable
              style={{ display: 'flex', marginTop: '4px', marginBottom: '4px' }}
              flow-children="horizontal"
            >
              <DialogButton style={rowBtnFirst} onClick={() => { void previous(); }}>⏮</DialogButton>
              <DialogButton style={rowBtn} onClick={() => { void togglePlay(); }}>
                {isPlaying ? '⏸' : '▶'}
              </DialogButton>
              <DialogButton style={rowBtn} onClick={() => { void next(); }}>⏭</DialogButton>
            </Focusable>
            <Focusable
              style={{ display: 'flex', marginTop: '4px', marginBottom: '4px' }}
              flow-children="horizontal"
            >
              <DialogButton style={rowBtnFirst} onClick={() => { void like(); }}>👍 Like</DialogButton>
              <DialogButton style={rowBtn} onClick={() => { void dislike(); }}>👎 Dislike</DialogButton>
            </Focusable>
          </>
        ) : (
          <>
            <ButtonItem onClick={() => { void previous(); }}>⏮ Previous</ButtonItem>
            <ButtonItem onClick={() => { void togglePlay(); }}>{isPlaying ? '⏸ Pause' : '▶ Play'}</ButtonItem>
            <ButtonItem onClick={() => { void next(); }}>⏭ Next</ButtonItem>
            <ButtonItem onClick={() => { void like(); }}>👍 Like</ButtonItem>
            <ButtonItem onClick={() => { void dislike(); }}>👎 Dislike</ButtonItem>
          </>
        )}
      </Section>

      {/* Volume */}
      <Section title="Volume">
        <PaddedSlider
          label={displayMuted ? 'Muted' : `${Math.round(displayVolume)}%`}
          value={displayVolume}
          min={0}
          max={100}
          step={1}
          onChange={handleVolumeChange}
          showValue={false}
        />
        <PaddedButton onClick={() => { void toggleMute(); }}>
          {displayMuted ? '🔇 Unmute' : '🔊 Mute'}
        </PaddedButton>
      </Section>

      {/* Playback options */}
      <Section title="Playback">
        <PaddedToggle
          label="Shuffle"
          checked={isShuffled}
          onChange={() => { void shuffle(); }}
        />
        <PaddedButton onClick={() => { void switchRepeat(REPEAT_NEXT[repeat] ?? 1); }}>
          {REPEAT_LABELS[repeat] ?? 'Repeat: Off'}
        </PaddedButton>
      </Section>
    </>
  );
};
