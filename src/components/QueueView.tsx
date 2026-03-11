import { PanelSection, PanelSectionRow } from '@decky/ui';
import { useEffect, useState } from 'react';
import { clearQueue, getQueue, removeFromQueue, setQueueIndex } from '../services/apiClient';
import type { QueueItem, QueueResponse } from '../types';

const getRenderer = (item: QueueItem) =>
  item.playlistPanelVideoRenderer ??
  item.playlistPanelVideoWrapperRenderer?.primaryRenderer?.playlistPanelVideoRenderer;

export const QueueView = () => {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadQueue = async () => {
    setLoading(true);
    const data: QueueResponse | null = await getQueue();
    setQueue(data?.items ?? []);
    setLoading(false);
  };

  useEffect(() => { void loadQueue(); }, []);

  const handleJump = async (index: number) => {
    await setQueueIndex(index);
    void loadQueue();
  };

  const handleRemove = async (index: number) => {
    await removeFromQueue(index);
    void loadQueue();
  };

  const handleClear = async () => {
    await clearQueue();
    setQueue([]);
  };

  if (loading) return <PanelSection><PanelSectionRow><div>Loading queue...</div></PanelSectionRow></PanelSection>;

  if (queue.length === 0) {
    return (
      <PanelSection title="Queue">
        <PanelSectionRow>
          <div style={{ color: 'var(--gpSystemLighterGrey)', fontSize: '12px' }}>Queue is empty</div>
        </PanelSectionRow>
      </PanelSection>
    );
  }

  return (
    <PanelSection title="Queue">
      <PanelSectionRow>
        <button
          onClick={() => { void handleClear(); }}
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
          Clear Queue
        </button>
      </PanelSectionRow>
      {queue.map((item, index) => {
        const r = getRenderer(item);
        const title = r?.title?.runs?.[0]?.text ?? 'Unknown';
        const artist = r?.shortBylineText?.runs?.[0]?.text ?? '';
        const isSelected = r?.selected ?? false;
        return (
          <PanelSectionRow key={index}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
              <div
                onClick={() => { void handleJump(index); }}
                style={{
                  flex: 1,
                  cursor: 'pointer',
                  fontWeight: isSelected ? 'bold' : 'normal',
                  fontSize: '12px',
                  overflow: 'hidden',
                }}
              >
                <div style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{title}</div>
                {artist && <div style={{ color: 'var(--gpSystemLighterGrey)', fontSize: '11px' }}>{artist}</div>}
              </div>
              <button
                onClick={() => { void handleRemove(index); }}
                style={{
                  flexShrink: 0,
                  width: '24px',
                  height: '24px',
                  padding: 0,
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  borderRadius: '4px',
                  color: 'white',
                  fontSize: '11px',
                  cursor: 'pointer',
                  lineHeight: 1,
                }}
              >
                ✕
              </button>
            </div>
          </PanelSectionRow>
        );
      })}
    </PanelSection>
  );
};
