import { DialogButton, Field, Focusable } from '@decky/ui';
import { useEffect, useState } from 'react';
import { FaTrash } from 'react-icons/fa';
import { clearQueue, getQueue, removeFromQueue, setQueueIndex } from '../services/apiClient';
import type { QueueItem, QueueResponse } from '../types';
import { Section } from './Section';

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
      <Section>
        <div style={{ padding: '16px 12px', color: 'var(--gpSystemLighterGrey)', fontSize: '12px' }}>
          Loading queue...
        </div>
      </Section>
    );
  }

  if (queue.length === 0) {
    return (
      <Section>
        <div style={{ padding: '8px 12px', color: 'var(--gpSystemLighterGrey)', fontSize: '12px' }}>
          Queue is empty
        </div>
      </Section>
    );
  }

  return (
    <Section>
      <Focusable>
        <DialogButton
          style={{ height: '35px', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '6px', paddingLeft: '13px', borderRadius: '0' }}
          onClick={() => { void handleClear(); }}
        >
          <FaTrash /> Clear Queue
        </DialogButton>
      </Focusable>

      {queue.map((item, index) => {
        const r = getRenderer(item);
        const title = r?.title?.runs?.[0]?.text ?? 'Unknown';
        const artist = r?.shortBylineText?.runs?.[0]?.text ?? '';
        const isSelected = r?.selected ?? false;

        if (DialogButton) {
          return (
            <Focusable
              key={index}
              style={{ display: 'flex', alignItems: 'stretch', marginTop: '2px', marginBottom: '2px' }}
              flow-children="horizontal"
            >
              <DialogButton
                style={{
                  flex: 1,
                  textAlign: 'left',
                  height: 'auto',
                  minHeight: '44px',
                  padding: '4px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  borderRadius: '0',
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
                  width: '36px',
                  minWidth: '0',
                  padding: '0',
                  marginLeft: '0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  borderRadius: '0',
                  borderLeft: '1px solid rgba(255,255,255,0.15)',
                }}
              >
                ✕
              </DialogButton>
            </Focusable>
          );
        }

        // Fallback when DialogButton unavailable
        return (
          <Field
            key={index}
            label={<span style={{ fontWeight: isSelected ? 'bold' : 'normal' }}>{title}</span>}
            description={artist || undefined}
            onActivate={() => { void handleJump(index); }}
            onClick={() => { void handleJump(index); }}
            highlightOnFocus
            focusable
            bottomSeparator="none"
          />
        );
      })}
    </Section>
  );
};
