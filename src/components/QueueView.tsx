import { ButtonItem, DialogButton, Field, PanelSection, PanelSectionRow } from '@decky/ui';
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

  if (loading) {
    return (
      <PanelSection>
        <PanelSectionRow><div>Loading queue...</div></PanelSectionRow>
      </PanelSection>
    );
  }

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
        <ButtonItem onClick={() => { void handleClear(); }}>Clear Queue</ButtonItem>
      </PanelSectionRow>

      {queue.map((item, index) => {
        const r = getRenderer(item);
        const title = r?.title?.runs?.[0]?.text ?? 'Unknown';
        const artist = r?.shortBylineText?.runs?.[0]?.text ?? '';
        const isSelected = r?.selected ?? false;

        return (
          <PanelSectionRow key={index}>
            <Field
              label={<span style={{ fontWeight: isSelected ? 'bold' : 'normal' }}>{title}</span>}
              description={artist || undefined}
              onActivate={() => { void handleJump(index); }}
              onClick={() => { void handleJump(index); }}
              highlightOnFocus
              focusable
              childrenContainerWidth="min"
              bottomSeparator="none"
            >
              <DialogButton
                onClick={() => { void handleRemove(index); }}
                style={{
                  width: '28px',
                  height: '28px',
                  minWidth: '0',
                  padding: '0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ✕
              </DialogButton>
            </Field>
          </PanelSectionRow>
        );
      })}
    </PanelSection>
  );
};
