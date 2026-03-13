import { ButtonItem, DialogButton, Focusable, SliderField, ToggleField } from '@decky/ui';
import type { SliderFieldProps } from '@decky/ui';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FaStepBackward, FaPlay, FaPause, FaStepForward, FaThumbsUp, FaThumbsDown, FaVolumeUp, FaRandom } from 'react-icons/fa';
import { MdRepeat, MdRepeatOne } from 'react-icons/md';
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
  togglePlay,
} from '../services/apiClient';
import { Section } from './Section';

const REPEAT_NEXT: Record<string, number> = { NONE: 1, ALL: 1, ONE: 1 };
const REPEAT_ICONS: Record<string, React.ReactElement> = {
  NONE: <MdRepeat size={16} style={{ opacity: 0.4 }} />,
  ALL:  <MdRepeat size={16} style={{ opacity: 1 }} />,
  ONE:  <MdRepeatOne size={16} style={{ opacity: 1 }} />,
};

const REPEAT_LABELS: Record<string, string> = {
  NONE: 'Off',
  ALL:  'All',
  ONE:  'One',
};

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
  el.style.paddingLeft = '16px';
  el.style.paddingRight = '16px';
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

// Persists across remounts (QAP close/reopen). Tracks the last value the user
// explicitly set via the slider. null = user has never touched it, safe to
// fetch from the API. Cleared on WS disconnect so a YTM restart re-fetches
// the fresh player volume.
let _lastUserVolume: number | null = null;

export const PlayerView = () => {
  const { song, isPlaying, volume, shuffle: isShuffled, repeat, position, connected } = usePlayer();

  // Seed from the user's last-set value on remount; fall back to context.
  const [displayVolume, setDisplayVolume] = useState(() => _lastUserVolume ?? volume);
  const adjustingRef = useRef(false);
  const cooldownTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wasConnectedRef = useRef(false);

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

  // Clear the user-set cache only on a true connected→disconnected transition
  // (e.g. YTM restart). Guarded by wasConnectedRef so the initial mount with
  // connected=false does NOT wipe the persisted user value.
  useEffect(() => {
    if (connected) {
      wasConnectedRef.current = true;
    } else if (wasConnectedRef.current) {
      _lastUserVolume = null;
    }
  }, [connected]);

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

      {/* Track info + progress bar */}
      {duration > 0 && (
        <Section>
          <PaddedSlider
            label={artist ? `${title} / ${artist}` : title}
            value={position}
            min={0}
            max={duration}
            step={1}
            onChange={(val) => { void seekTo(val); }}
            showValue={false}
          />
        </Section>
      )}

      {/* Prev / Play / Next */}
      <Section noPull>
        {DialogButton ? (
          <>
            <Focusable
              style={{ display: 'flex', marginTop: '4px', marginBottom: '4px' }}
              flow-children="horizontal"
            >
              <DialogButton style={rowBtnFirst} onClick={() => { void previous(); }}><FaStepBackward /></DialogButton>
              <DialogButton style={rowBtn} onClick={() => { void togglePlay(); }}>
                {isPlaying ? <FaPause /> : <FaPlay />}
              </DialogButton>
              <DialogButton style={rowBtn} onClick={() => { void next(); }}><FaStepForward /></DialogButton>
            </Focusable>
            <Focusable
              style={{ display: 'flex', marginTop: '4px', marginBottom: '4px' }}
              flow-children="horizontal"
            >
              <DialogButton style={rowBtnFirst} onClick={() => { void like(); }}><FaThumbsUp /></DialogButton>
              <DialogButton style={rowBtn} onClick={() => { void dislike(); }}><FaThumbsDown /></DialogButton>
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

      {/* Volume */}
      <Section>
        <PaddedSlider
          icon={<FaVolumeUp size={14} />}
          value={displayVolume}
          min={0}
          max={100}
          step={1}
          onChange={handleVolumeChange}
          showValue={false}
        />
      </Section>

      {/* Playback options */}
      <Section>
        <PaddedToggle
          label={<span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FaRandom size={12} /> Shuffle</span>}
          checked={isShuffled}
          onChange={() => { void shuffle(); }}
        />
        <Focusable>
          <DialogButton
            style={{ height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '6px', paddingLeft: '16px' }}
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
