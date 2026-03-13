import { ButtonItem, DialogButton, Focusable, SliderField, ToggleField } from '@decky/ui';
import type { SliderFieldProps } from '@decky/ui';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FaStepBackward, FaPlay, FaPause, FaStepForward, FaThumbsUp, FaThumbsDown, FaVolumeUp, FaRandom, FaMusic } from 'react-icons/fa';
import { MdRepeat, MdRepeatOne } from 'react-icons/md';
import { usePlayer } from '../context/PlayerContext';
import {
  dislike,
  getVolume,
  like,
  next,
  previous,
  setVolume,
  shuffle,
  switchRepeat,
  togglePlay,
} from '../services/apiClient';
import { addStateListener } from '../services/websocketService';
import { Section } from './Section';

const REPEAT_NEXT: Record<string, number> = { NONE: 1, ALL: 1, ONE: 1 };
const REPEAT_ICONS: Record<string, React.ReactElement> = {
  NONE: <MdRepeat size={18} style={{ opacity: 0.4, margin: '-2px' }} />,
  ALL:  <MdRepeat size={18} style={{ opacity: 1, margin: '-2px' }} />,
  ONE:  <MdRepeatOne size={18} style={{ opacity: 1, margin: '-2px' }} />,
};

const REPEAT_LABELS: Record<string, string> = {
  NONE: 'Off',
  ALL:  'All',
  ONE:  'One',
};

const rowBtnBase: React.CSSProperties = {
  height: '30px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: '0',
  flex: 1,
  padding: '0 8px',
  marginLeft: '0',
};

const rowBtnFirst: React.CSSProperties = { ...rowBtnBase, borderRadius: '4px 0 0 4px' };
const rowBtnMid: React.CSSProperties   = { ...rowBtnBase, borderRadius: '0', borderLeft: '1px solid rgba(255,255,255,0.15)' };
const rowBtnLast: React.CSSProperties  = { ...rowBtnBase, borderRadius: '0 4px 4px 0', borderLeft: '1px solid rgba(255,255,255,0.15)' };

// Applies padding to Decky item elements (buttons, toggles) and removes
// hardcoded min-width (270px) by finding the offending element at mount.
const applyInnerPadding = (el: HTMLElement) => {
  el.style.paddingLeft = '19px';
  el.style.paddingRight = '19px';
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
      firstChild.style.paddingLeft = '19px';
      firstChild.style.paddingRight = '19px';
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

// Persists across remounts (QAP close/reopen). Tracks the last value the user
// explicitly set via the slider. null = user has never touched it, safe to
// fetch from the API. Cleared on WS disconnect (module-level listener below)
// so a YTM restart always re-fetches the fresh player volume — even if the
// component was unmounted when YTM disconnected.
let _lastUserVolume: number | null = null;

// Module-level listener: clears stale volume whenever YTM disconnects,
// regardless of whether PlayerView is currently mounted.
addStateListener((partial) => {
  if (partial.connected === false) _lastUserVolume = null;
});

export const PlayerView = () => {
  const { song, isPlaying, shuffle: isShuffled, repeat, connected } = usePlayer();

  // Seed from the user's last-set value on remount. On first load (null),
  // displayVolume stays null until fetchVolume() resolves via HTTP.
  // We never fall back to context.volume because it carries the WebSocket
  // scale (different from the 0-100 linear scale the slider and setVolume use).
  const [displayVolume, setDisplayVolume] = useState<number | null>(() => _lastUserVolume);
  const adjustingRef = useRef(false);
  const cooldownTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Only fetch from the API when the user hasn't set a value yet.
  // getVolume() returns the player's internal scale which differs from the
  // 0-100 linear scale setVolume() accepts — so we must never call it after
  // the user has touched the slider.
  const fetchVolume = useCallback(() => {
    if (_lastUserVolume !== null) return;
    void getVolume().then((res) => {
      if (res !== null && !adjustingRef.current) {
        setDisplayVolume(res.state);
      }
    });
  }, []);

  // Fetch on mount — covers the !Tabs fallback remount case.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (connected) fetchVolume(); }, []);

  // Fetch on connect/reconnect (e.g. after YTM restart).
  useEffect(() => { if (connected) fetchVolume(); }, [connected, fetchVolume]);

  // Cleanup timers on unmount.
  useEffect(() => () => {
    if (cooldownTimer.current) clearTimeout(cooldownTimer.current);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
  }, []);

  const handleVolumeChange = (val: number) => {
    _lastUserVolume = val;
    setDisplayVolume(val);
    adjustingRef.current = true;

    // Keep adjustingRef true for 1500ms so the mount-time getVolume() fetch
    // and any volume WebSocket sync don't overwrite the user's in-flight value.
    if (cooldownTimer.current) clearTimeout(cooldownTimer.current);
    cooldownTimer.current = setTimeout(() => { adjustingRef.current = false; }, 1500);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => { void setVolume(val); }, 300);
  };

  const albumArt = song?.albumArt;
  const title = song?.title ?? 'Nothing playing';
  const artist = song?.artist ?? '';

  return (
    <>
      {/* Track info: album art + title/artist */}
      {/* Note: Section applies margin: '0 -10px'. The 12px horizontal padding here
          restores alignment (10px offset + 2px visual inset). Do not remove it. */}
      <Section>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 16px' }}>
          {albumArt ? (
            <img
              src={albumArt}
              alt="Album art"
              style={{ width: '72px', height: '72px', borderRadius: '4px', objectFit: 'cover', flexShrink: 0 }}
            />
          ) : (
            <div style={{
              width: '72px', height: '72px', borderRadius: '4px', flexShrink: 0,
              background: 'rgba(255,255,255,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--gpSystemLighterGrey)',
            }}>
              <FaMusic size={36} />
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0 }}>
            <div style={{ fontWeight: 'bold', fontSize: '15px', color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {title}
            </div>
            {artist && (
              <div style={{ fontSize: '12px', color: 'var(--gpSystemLighterGrey)', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {artist}
              </div>
            )}
          </div>
        </div>
      </Section>

      {/* Prev / Play / Next */}
      <div style={{ marginTop: '10px', marginBottom: '10px', paddingLeft: '5px', paddingRight: '5px' }}>
      <Section noPull>
        {DialogButton ? (
          <>
            <Focusable
              style={{ display: 'flex', marginTop: '4px', marginBottom: '4px' }}
              flow-children="horizontal"
            >
              <DialogButton style={rowBtnFirst} onClick={() => { void previous(); }}><FaStepBackward /></DialogButton>
              <DialogButton style={rowBtnMid} onClick={() => { void togglePlay(); }}>
                {isPlaying ? <FaPause /> : <FaPlay />}
              </DialogButton>
              <DialogButton style={rowBtnLast} onClick={() => { void next(); }}><FaStepForward /></DialogButton>
            </Focusable>
            <Focusable
              style={{ display: 'flex', marginTop: '4px', marginBottom: '4px' }}
              flow-children="horizontal"
            >
              <DialogButton style={rowBtnFirst} onClick={() => { void like(); }}><FaThumbsUp /></DialogButton>
              <DialogButton style={rowBtnLast} onClick={() => { void dislike(); }}><FaThumbsDown /></DialogButton>
            </Focusable>
          </>
        ) : (
          <>
            <ButtonItem onClick={() => { void previous(); }}><FaStepBackward /> Previous</ButtonItem>
            <ButtonItem onClick={() => { void togglePlay(); }}>{isPlaying ? <><FaPause /> Pause</> : <><FaPlay /> Play</>}</ButtonItem>
            <ButtonItem onClick={() => { void next(); }}><FaStepForward /> Next</ButtonItem>
            <ButtonItem onClick={() => { void like(); }}><FaThumbsUp /></ButtonItem>
            <ButtonItem onClick={() => { void dislike(); }}><FaThumbsDown /></ButtonItem>
          </>
        )}
      </Section>
      </div>

      {/* Volume */}
      <Section>
        {displayVolume !== null && (
          <PaddedSlider
            icon={<FaVolumeUp size={18} />}
            value={displayVolume}
            min={0}
            max={100}
            step={1}
            onChange={handleVolumeChange}
            showValue={false}
          />
        )}
      </Section>

      {/* Playback options */}
      <Section>
        <PaddedToggle
          label={<span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FaRandom size={14} /> Shuffle</span>}
          checked={isShuffled}
          onChange={() => { void shuffle(); }}
        />
        <Focusable>
          <DialogButton
            style={{ height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '6px', paddingLeft: '19px', paddingRight: '19px', borderRadius: '0' }}
            onClick={() => { void switchRepeat(REPEAT_NEXT[repeat] ?? 1); }}
          >
            {REPEAT_ICONS[repeat] ?? REPEAT_ICONS.NONE}
            Repeat: {REPEAT_LABELS[repeat] ?? 'Off'}
          </DialogButton>
        </Focusable>
      </Section>
    </>
  );
};
