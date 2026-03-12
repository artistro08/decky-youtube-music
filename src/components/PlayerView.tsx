import { ButtonItem, DialogButton, Focusable, SliderField, ToggleField } from '@decky/ui';
import type { SliderFieldProps } from '@decky/ui';
import { useEffect, useRef } from 'react';
import { usePlayer } from '../context/PlayerContext';
import {
  dislike,
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

export const PlayerView = () => {
  const { song, isPlaying, volume, muted, shuffle: isShuffled, repeat, position } = usePlayer();

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
          label={muted ? 'Muted' : `${Math.round(volume)}%`}
          value={muted ? 0 : volume}
          min={0}
          max={100}
          step={1}
          onChange={(val) => { void setVolume(val); }}
          showValue={false}
        />
        <PaddedButton onClick={() => { void toggleMute(); }}>
          {muted ? '🔇 Unmute' : '🔊 Mute'}
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
