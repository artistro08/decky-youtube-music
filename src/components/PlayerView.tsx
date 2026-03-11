import { PanelSection, PanelSectionRow, SliderField, ToggleField } from '@decky/ui';
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

const REPEAT_LABELS: Record<string, string> = { NONE: 'Repeat: Off', ALL: 'Repeat: All', ONE: 'Repeat: One' };
const REPEAT_ITERATIONS: Record<string, number> = { NONE: 1, ALL: 1, ONE: 1 };

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
                style={{ width: '100%', maxWidth: '200px', borderRadius: '8px' }}
              />
            </div>
          </PanelSectionRow>
        </PanelSection>
      )}

      {/* Track info */}
      <PanelSection>
        <PanelSectionRow>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 'bold', fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {title}
            </div>
            {artist && (
              <div style={{ fontSize: '12px', color: 'var(--gpSystemLighterGrey)', marginTop: '2px' }}>
                {artist}
              </div>
            )}
          </div>
        </PanelSectionRow>

        {/* Seek bar */}
        {duration > 0 && (
          <PanelSectionRow>
            <SliderField
              label=""
              value={position}
              min={0}
              max={duration}
              step={1}
              onChange={(val) => { void seekTo(val); }}
              showValue={false}
            />
          </PanelSectionRow>
        )}
      </PanelSection>

      {/* Playback controls */}
      <PanelSection title="Controls">
        <PanelSectionRow>
          <div style={{ display: 'flex', gap: '6px', width: '100%' }}>
            {([
              { label: '⏮', action: previous },
              { label: isPlaying ? '⏸' : '▶', action: togglePlay },
              { label: '⏭', action: next },
            ] as { label: string; action: () => void }[]).map(({ label, action }) => (
              <button
                key={label}
                onClick={() => { void action(); }}
                style={{
                  flex: 1,
                  padding: '8px 4px',
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  borderRadius: '4px',
                  color: 'white',
                  fontSize: '18px',
                  cursor: 'pointer',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </PanelSectionRow>

        {/* Like / Dislike */}
        <PanelSectionRow>
          <div style={{ display: 'flex', gap: '6px', width: '100%' }}>
            {([
              { label: '👍 Like', action: like },
              { label: '👎 Dislike', action: dislike },
            ] as { label: string; action: () => void }[]).map(({ label, action }) => (
              <button
                key={label}
                onClick={() => { void action(); }}
                style={{
                  flex: 1,
                  padding: '6px 4px',
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  borderRadius: '4px',
                  color: 'white',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </PanelSectionRow>
      </PanelSection>

      {/* Volume */}
      <PanelSection title="Volume">
        <PanelSectionRow>
          <SliderField
            label={muted ? 'Muted' : `${Math.round(volume)}%`}
            value={muted ? 0 : volume}
            min={0}
            max={100}
            step={1}
            onChange={(val) => { void setVolume(val); }}
            showValue={false}
          />
        </PanelSectionRow>
        <PanelSectionRow>
          <button
            onClick={() => { void toggleMute(); }}
            style={{
              width: '100%',
              padding: '6px',
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '4px',
              color: 'white',
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            {muted ? '🔇 Unmute' : '🔊 Mute'}
          </button>
        </PanelSectionRow>
      </PanelSection>

      {/* Shuffle & Repeat */}
      <PanelSection title="Playback Mode">
        <PanelSectionRow>
          <ToggleField
            label="Shuffle"
            checked={isShuffled}
            onChange={() => { void shuffle(); }}
          />
        </PanelSectionRow>
        <PanelSectionRow>
          <button
            onClick={() => { void switchRepeat(REPEAT_ITERATIONS[repeat] ?? 1); }}
            style={{
              width: '100%',
              padding: '6px',
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '4px',
              color: 'white',
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            {REPEAT_LABELS[repeat] ?? 'Repeat: Off'}
          </button>
        </PanelSectionRow>
      </PanelSection>
    </>
  );
};
