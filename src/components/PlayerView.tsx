import { ButtonItem, DialogButton, Focusable, PanelSection, PanelSectionRow, SliderField, ToggleField } from '@decky/ui';
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
        <PanelSection>
          <PanelSectionRow>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <img
                src={albumArt}
                alt="Album art"
                style={{ width: '100%', maxWidth: '180px', borderRadius: '8px' }}
              />
            </div>
          </PanelSectionRow>
        </PanelSection>
      )}

      {/* Track info */}
      <PanelSection>
        <PanelSectionRow>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 'bold', fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {title}
            </div>
            {artist && (
              <div style={{ fontSize: '11px', color: 'var(--gpSystemLighterGrey)', marginTop: '2px' }}>
                {artist}
              </div>
            )}
          </div>
        </PanelSectionRow>

        {duration > 0 && (
          <div style={{ margin: '0 -16px', padding: '0 8px' }}>
            <SliderField
              label=""
              value={position}
              min={0}
              max={duration}
              step={1}
              onChange={(val) => { void seekTo(val); }}
              showValue={false}
            />
          </div>
        )}
      </PanelSection>

      {/* Prev / Play / Next */}
      <PanelSection title="Controls">
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
            <PanelSectionRow><ButtonItem onClick={() => { void previous(); }}>⏮ Previous</ButtonItem></PanelSectionRow>
            <PanelSectionRow><ButtonItem onClick={() => { void togglePlay(); }}>{isPlaying ? '⏸ Pause' : '▶ Play'}</ButtonItem></PanelSectionRow>
            <PanelSectionRow><ButtonItem onClick={() => { void next(); }}>⏭ Next</ButtonItem></PanelSectionRow>
            <PanelSectionRow><ButtonItem onClick={() => { void like(); }}>👍 Like</ButtonItem></PanelSectionRow>
            <PanelSectionRow><ButtonItem onClick={() => { void dislike(); }}>👎 Dislike</ButtonItem></PanelSectionRow>
          </>
        )}
      </PanelSection>

      {/* Volume */}
      <PanelSection title="Volume">
        <div style={{ margin: '0 -16px', padding: '0 8px' }}>
          <SliderField
            label={muted ? 'Muted' : `${Math.round(volume)}%`}
            value={muted ? 0 : volume}
            min={0}
            max={100}
            step={1}
            onChange={(val) => { void setVolume(val); }}
            showValue={false}
          />
        </div>
        <PanelSectionRow>
          <ButtonItem onClick={() => { void toggleMute(); }}>
            {muted ? '🔇 Unmute' : '🔊 Mute'}
          </ButtonItem>
        </PanelSectionRow>
      </PanelSection>

      {/* Playback options */}
      <PanelSection title="Playback">
        <PanelSectionRow>
          <ToggleField
            label="Shuffle"
            checked={isShuffled}
            onChange={() => { void shuffle(); }}
          />
        </PanelSectionRow>
        <PanelSectionRow>
          <ButtonItem onClick={() => { void switchRepeat(REPEAT_NEXT[repeat] ?? 1); }}>
            {REPEAT_LABELS[repeat] ?? 'Repeat: Off'}
          </ButtonItem>
        </PanelSectionRow>
      </PanelSection>
    </>
  );
};
