import { useEffect, useRef } from 'react';
import Hls from 'hls.js';

interface HlsVideoProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
  src: string;
}

export default function HlsVideo({ src, className, ...props }: HlsVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hls: Hls | null = null;

    if (Hls.isSupported()) {
      hls = new Hls({
        autoStartLoad: true,
      });
      hls.loadSource(src);
      hls.attachMedia(video);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [src]);

  return (
    <video
      ref={videoRef}
      className={className}
      muted
      loop
      playsInline
      {...props}
    />
  );
}
