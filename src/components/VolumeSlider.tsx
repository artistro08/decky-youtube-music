import { SliderField } from '@decky/ui';
import type { SliderFieldProps } from '@decky/ui';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FaVolumeUp } from 'react-icons/fa';
import { getVolume, setVolume } from '../services/apiClient';
import { usePlayer } from '../context/PlayerContext';

// After the user moves the slider, suppress re-fetch for this long
// so the slider doesn't jump while the API call is in flight.
const USER_ADJUST_GRACE_MS = 1500;

// Module-level cache — survives tab switches (component remounts) so the
// slider shows the last known value immediately instead of flashing to 0.
let cachedVolume: number | null = null;

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
  const { connected } = usePlayer();
  // Initialise from cache so remounts show the last known value instantly.
  const [displayVolume, setDisplayVolume] = useState<number | null>(cachedVolume);

  const userAdjustingRef = useRef(false);
  const userAdjustTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const apiDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch the real volume from YTM via HTTP whenever we (re)connect.
  // HTTP GET /volume is the only reliable source — WS volume events can carry
  // stale or differently-scaled values and must not drive the display directly.
  useEffect(() => {
    if (!connected) return;
    void getVolume().then((res) => {
      if (res !== null) {
        cachedVolume = res.state;
        setDisplayVolume(res.state);
      }
    });
  }, [connected]);

  // Clear pending timers on unmount to avoid stale callbacks.
  useEffect(() => {
    return () => {
      if (userAdjustTimerRef.current) clearTimeout(userAdjustTimerRef.current);
      if (apiDebounceRef.current) clearTimeout(apiDebounceRef.current);
    };
  }, []);

  const handleChange = useCallback((val: number) => {
    setDisplayVolume(val);
    cachedVolume = val; // keep cache in sync so remounts reflect the drag

    // Suppress the post-drag re-fetch while the user is still moving.
    userAdjustingRef.current = true;
    if (userAdjustTimerRef.current) clearTimeout(userAdjustTimerRef.current);
    userAdjustTimerRef.current = setTimeout(() => {
      userAdjustingRef.current = false;
      // Confirm the settled value via HTTP once the grace period expires.
      void getVolume().then((res) => {
        if (res !== null) {
          cachedVolume = res.state;
          setDisplayVolume(res.state);
        }
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
      value={displayVolume ?? 0}
      min={0}
      max={100}
      step={1}
      onChange={handleChange}
      showValue={false}
      disabled={!connected || displayVolume === null}
    />
  );
};
