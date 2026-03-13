import { SliderField } from '@decky/ui';
import type { SliderFieldProps } from '@decky/ui';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FaVolumeUp } from 'react-icons/fa';
import { getVolume, setVolume } from '../services/apiClient';
import { usePlayer } from '../context/PlayerContext';

// After the user moves the slider, suppress context sync for this long
// so the slider doesn't jump while the API call is in flight.
const USER_ADJUST_GRACE_MS = 1500;

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

export const VolumeSlider = () => {
  const { volume: contextVolume, connected } = usePlayer();
  const [displayVolume, setDisplayVolume] = useState<number>(contextVolume);

  const userAdjustingRef = useRef(false);
  const userAdjustTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const apiDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync from context whenever it changes, unless the user is mid-adjust.
  useEffect(() => {
    if (!userAdjustingRef.current) {
      setDisplayVolume(contextVolume);
    }
  }, [contextVolume]);

  // Clear pending timers on unmount to avoid stale callbacks.
  useEffect(() => {
    return () => {
      if (userAdjustTimerRef.current) clearTimeout(userAdjustTimerRef.current);
      if (apiDebounceRef.current) clearTimeout(apiDebounceRef.current);
    };
  }, []);

  const handleChange = useCallback((val: number) => {
    setDisplayVolume(val);

    // Suppress context sync while adjusting.
    userAdjustingRef.current = true;
    if (userAdjustTimerRef.current) clearTimeout(userAdjustTimerRef.current);
    userAdjustTimerRef.current = setTimeout(() => {
      userAdjustingRef.current = false;
      // One-shot re-fetch to confirm the value if YTM doesn't echo back via WS.
      void getVolume().then((res) => {
        if (res !== null) setDisplayVolume(res.state);
      });
    }, USER_ADJUST_GRACE_MS);

    // Debounce the actual API call.
    if (apiDebounceRef.current) clearTimeout(apiDebounceRef.current);
    apiDebounceRef.current = setTimeout(() => {
      void setVolume(val);
    }, 300);
  }, []);

  return (
    <PaddedSlider
      icon={<FaVolumeUp size={18} />}
      value={displayVolume}
      min={0}
      max={100}
      step={1}
      onChange={handleChange}
      showValue={false}
      disabled={!connected}
    />
  );
};
