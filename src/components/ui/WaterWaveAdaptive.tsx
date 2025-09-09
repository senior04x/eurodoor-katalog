import React, { useEffect, useMemo, useRef, useState } from 'react';
import WaterWave3D from './WaterWave3D';

interface WaterWaveAdaptiveProps {
  className?: string;
  style?: React.CSSProperties;
  speedSec?: number;
  amplitude?: number;
  frequency?: number;
  shallowColor?: string;
  deepColor?: string;
  foamColor?: string;
  /** Optional custom video sources */
  mp4Src?: string;
  webmSrc?: string;
}

const DEFAULT_MP4 = 'https://cdn.coverr.co/videos/coverr-waves-1576/1080p.mp4';
const DEFAULT_WEBM = 'https://cdn.coverr.co/videos/coverr-waves-1576/1080p.webm';

export default function WaterWaveAdaptive({
  className,
  style,
  speedSec,
  amplitude,
  frequency,
  shallowColor,
  deepColor,
  foamColor,
  mp4Src = DEFAULT_MP4,
  webmSrc = DEFAULT_WEBM
}: WaterWaveAdaptiveProps) {
  const [useVideo, setUseVideo] = useState(false);
  const [canPlay, setCanPlay] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const { isMobile, isIOS } = useMemo(() => {
    if (typeof navigator === 'undefined') return false;
    const ua = navigator.userAgent;
    const mobile = /Mobi|Android|iPhone|iPad|iPod/i.test(ua);
    const ios = /iPhone|iPad|iPod/i.test(ua);
    return { isMobile: mobile, isIOS: ios };
  }, []);

  useEffect(() => {
    // Prefer WebGL if supported; only fallback to video if WebGL not available
    const webglSupported = (() => {
      try {
        const canvas = document.createElement('canvas');
        return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
      } catch {
        return false;
      }
    })();

    setUseVideo(!webglSupported);
  }, []);

  useEffect(() => {
    if (!useVideo) return;
    const v = videoRef.current;
    if (!v) return;
    const play = async () => {
      try {
        await v.play();
        setCanPlay(true);
      } catch {
        // Auto-play might be blocked until metadata is ready
        v.muted = true;
        v.setAttribute('muted', '');
        try {
          await v.play();
          setCanPlay(true);
        } catch {
          setCanPlay(false);
        }
      }
    };
    const onCanPlay = () => play();
    const onVisibility = () => { if (document.visibilityState === 'visible') play(); };
    const onTouch = () => play();
    v.addEventListener('canplay', onCanPlay);
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('touchstart', onTouch, { once: true });
    play();
    return () => {
      v.removeEventListener('canplay', onCanPlay);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('touchstart', onTouch);
    };
  }, [useVideo]);

  if (useVideo) {
    return (
      <div className={className} style={{ ...style, overflow: 'hidden' }}>
        <video
          ref={videoRef}
          className="w-full h-full object-cover pointer-events-none"
          playsInline
          autoPlay
          loop
          muted
          preload="auto"
          aria-hidden
        >
          <source src={webmSrc} type="video/webm" />
          <source src={mp4Src} type="video/mp4" />
        </video>
        {!canPlay && (
          <div className="absolute inset-0" style={{
            background: `linear-gradient(180deg, ${shallowColor || '#45c0ff'}, ${deepColor || '#0b5f9a'})`
          }} />
        )}
      </div>
    );
  }

  // Desktop/WebGL path
  return (
    <WaterWave3D
      className={className}
      style={style}
      speedSec={speedSec}
      amplitude={amplitude}
      frequency={frequency}
      shallowColor={shallowColor}
      deepColor={deepColor}
      foamColor={foamColor}
    />
  );
}

