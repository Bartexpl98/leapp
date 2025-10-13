'use client';

import { useEffect, useMemo, useState } from 'react';

type Location = {
  city?: string | null;
  region?: string | null;
  country?: string | null;
};

type Props = {
  initialLocation?: Location | null;
  timeZone?: string;
  hour12?: boolean;
  className?: string;
};

export default function DateCard({
  initialLocation = null,
  timeZone,
  hour12,
  className = '',
}: Props) {
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState<Date | null>(null);
  const [location, setLocation] = useState<Location | null>(initialLocation);
  const [locStatus, setLocStatus] = useState<
    'idle' | 'loading' | 'precise' | 'denied' | 'error'
  >('idle');

  // Mount + refresh every 30s
  useEffect(() => {
    setMounted(true);
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  // IP-based fallback location
  useEffect(() => {
    if (initialLocation) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/ip-location', { cache: 'no-store' });
        if (!res.ok) return;
        const data = (await res.json()) as Location;
        if (!cancelled) setLocation(data);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [initialLocation]);

  const locale =
    typeof navigator !== 'undefined' ? navigator.language : 'en-GB';

  // 🕒 Time: hour + minute only
  const timeStr = useMemo(() => {
    if (!now) return '—';
    return new Intl.DateTimeFormat(locale, {
      hour: '2-digit',
      minute: '2-digit',
      hour12,
      timeZone,
    }).format(now);
  }, [now, locale, hour12, timeZone]);

  // 📅 Date: short form
  const dateStr = useMemo(() => {
    if (!now) return '—';
    return new Intl.DateTimeFormat(locale, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone,
    }).format(now);
  }, [now, locale, timeZone]);

  const tzShort = useMemo(() => {
    if (!now) return '';
    const parts = new Intl.DateTimeFormat(locale, {
      timeZone,
      timeZoneName: 'short',
    })
      .formatToParts(now)
      .find((p) => p.type === 'timeZoneName')?.value;
    return parts ?? '';
  }, [now, locale, timeZone]);

  async function handleUsePreciseLocation() {
    if (!('geolocation' in navigator)) {
      setLocStatus('error');
      return;
    }
    setLocStatus('loading');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=${locale.split('-')[0]}`;
          const res = await fetch(url);
          const data = await res.json();
          const city =
            data.locality || data.city || data.localityInfo?.administrative?.[2]?.name || null;
          const region = data.principalSubdivision || null;
          const country = data.countryName || null;
          setLocation({ city, region, country });
          setLocStatus('precise');
        } catch {
          setLocStatus('error');
        }
      },
      (err) => {
        if (err.code === 1) setLocStatus('denied');
        else setLocStatus('error');
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
    );
  }

  return (
    <div
      className={`w-full max-w-sm md:max-w-md rounded-xl bg-black/80 shadow-lg backdrop-blur-md p-3 text-white flex flex-col gap-1 ${className}`}
    >
      {/* Top line: time + date + timezone */}
      <div
        className="flex items-center justify-between text-base md:text-lg font-semibold"
        suppressHydrationWarning
      >
        <span>
          {mounted ? `${timeStr}` : '—'}{' '}
          <span className="text-sm opacity-70">{tzShort}</span>
        </span>
        <span className="text-sm opacity-80">{mounted ? dateStr : '—'}</span>
      </div>

      {/* Bottom line: location */}
      <div className="flex items-center justify-between text-sm">
        <span className="truncate">
          {location?.city || location?.region || location?.country ? (
            <>
              {location.city ? `${location.city}, ` : ''}
              {location.region ? `${location.region}, ` : ''}
              {location.country ?? ''}
            </>
          ) : (
            <span className="opacity-75">Unknown</span>
          )}
        </span>

        <button
          onClick={handleUsePreciseLocation}
          className="rounded-md bg-blue-500 px-2 py-0.5 text-xs font-medium hover:bg-blue-400 disabled:opacity-50"
          disabled={locStatus === 'loading'}
        >
          {locStatus === 'loading' ? '...' : 'Detect'}
        </button>
      </div>
    </div>
  );
}
