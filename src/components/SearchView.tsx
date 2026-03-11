import { ButtonItem, TextField } from '@decky/ui';
import { useState } from 'react';
import { addToQueue, clearQueue, search, setQueueIndex } from '../services/apiClient';
import type { SearchResultItem } from '../types';
import { Section } from './Section';

export const SearchView = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    const data = await search(query.trim());
    // Filter to songs only
    setResults(data.filter((r) => !r.resultType || r.resultType === 'song').slice(0, 20));
    setSearched(true);
    setSearching(false);
  };

  const handlePlay = async (item: SearchResultItem) => {
    if (!item.videoId) return;
    // Clear queue, add song at front, play it
    await clearQueue();
    await addToQueue(item.videoId, 'INSERT_AT_BEGINNING');
    await setQueueIndex(0);
  };

  return (
    <>
      <Section title="Search">
        <TextField
          label="Search YouTube Music"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') void handleSearch(); }}
        />
        <ButtonItem layout="below" onClick={() => { void handleSearch(); }} disabled={searching || !query.trim()}>
          {searching ? 'Searching...' : 'Search'}
        </ButtonItem>
      </Section>

      {searched && results.length === 0 && (
        <Section>
          <div style={{ padding: '8px 16px', color: 'var(--gpSystemLighterGrey)', fontSize: '12px' }}>
            No results found
          </div>
        </Section>
      )}

      {results.length > 0 && (
        <Section title="Results">
          {results.map((item, index) => (
            <ButtonItem
              key={index}
              layout="below"
              onClick={() => { void handlePlay(item); }}
            >
              <div style={{ textAlign: 'left', width: '100%' }}>
                <div style={{ fontWeight: 'bold', fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.title ?? 'Unknown'}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--gpSystemLighterGrey)' }}>
                  {item.artists?.map((a) => a.name).join(', ') ?? ''}
                </div>
              </div>
            </ButtonItem>
          ))}
        </Section>
      )}
    </>
  );
};
