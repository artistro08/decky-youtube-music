import { ButtonItem, DialogButton, Field, Focusable, PanelSection, PanelSectionRow } from '@decky/ui';
import { useEffect, useState } from 'react';
import { clearQueue, getQueue, removeFromQueue, setQueueIndex } from '../services/apiClient';
import type { QueueItem, QueueResponse } from '../types';

const getRenderer = (item: QueueItem) =>
  item.playlistPanelVideoRenderer ??
  item.playlistPanelVideoWrapperRenderer?.primaryRenderer?.playlistPanelVideoRenderer;

export const QueueView = () => {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadQueue = async (silent = false) => {
    if (!silent) setLoading(true);
    const data: QueueResponse | null = await getQueue();
    setQueue(data?.items ?? []);
    if (!silent) setLoading(false);
  };

  useEffect(() => { void loadQueue(); }, []);

  const handleJump = async (index: number) => {
    await setQueueIndex(index);
    void loadQueue(true);
  };

  const handleRemove = async (index: number) => {
    await removeFromQueue(index);
    void loadQueue(true);
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

        if (DialogButton) {
          return (
            <Focusable
              key={index}
              style={{ display: 'flex', alignItems: 'center', marginTop: '2px', marginBottom: '2px', marginLeft: '-16px', marginRight: '-16px' }}
              flow-children="horizontal"
            >
              <DialogButton
                style={{
                  flex: 1,
                  textAlign: 'left',
                  height: 'auto',
                  minHeight: '40px',
                  padding: '4px 8px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}
                onClick={() => { void handleJump(index); }}
              >
                <div style={{ fontWeight: isSelected ? 'bold' : 'normal', fontSize: '13px' }}>{title}</div>
                {artist && (
                  <div style={{ fontSize: '11px', color: 'var(--gpSystemLighterGrey)', marginTop: '2px' }}>
                    {artist}
                  </div>
                )}
              </DialogButton>
              <DialogButton
                onClick={() => { void handleRemove(index); }}
                style={{
                  width: '28px',
                  height: '28px',
                  minWidth: '0',
                  padding: '0',
                  marginLeft: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                ✕
              </DialogButton>
            </Focusable>
          );
        }

        // Fallback when DialogButton unavailable
        return (
          <PanelSectionRow key={index}>
            <Field
              label={<span style={{ fontWeight: isSelected ? 'bold' : 'normal' }}>{title}</span>}
              description={artist || undefined}
              onActivate={() => { void handleJump(index); }}
              onClick={() => { void handleJump(index); }}
              highlightOnFocus
              focusable
              bottomSeparator="none"
            />
          </PanelSectionRow>
        );
      })}
    </PanelSection>
  );
};
