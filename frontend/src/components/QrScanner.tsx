import React, { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';

/** Reads a QR code from the device camera. Falls back to a message if the camera is unavailable. */
const QrScanner: React.FC<{ onResult: (value: string) => void }> = ({ onResult }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState('');
  const resultRef = useRef(onResult);
  resultRef.current = onResult;

  useEffect(() => {
    let stream: MediaStream | null = null;
    let frame = 0;
    let stopped = false;
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d', { willReadFrequently: true });

    const scan = () => {
      if (stopped) return;
      const video = videoRef.current;
      if (video && context && video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);
        const image = context.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(image.data, image.width, image.height, { inversionAttempts: 'dontInvert' });
        if (code?.data) {
          resultRef.current(code.data);
          return;
        }
      }
      frame = requestAnimationFrame(scan);
    };

    navigator.mediaDevices
      ?.getUserMedia({ video: { facingMode: 'environment' } })
      .then((media) => {
        if (stopped) {
          media.getTracks().forEach((track) => track.stop());
          return;
        }
        stream = media;
        if (videoRef.current) {
          videoRef.current.srcObject = media;
          videoRef.current.play().catch(() => {});
        }
        scan();
      })
      .catch(() => setError("We couldn't open the camera. Enter the code by hand instead."));

    if (!navigator.mediaDevices) {
      setError('This browser can only use the camera on a secure (https) page. Enter the code by hand instead.');
    }

    return () => {
      stopped = true;
      cancelAnimationFrame(frame);
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  if (error) {
    return <p className="rounded-xl bg-textMain/5 p-4 text-sm text-textMain-secondary">{error}</p>;
  }

  return (
    <div className="relative aspect-square overflow-hidden rounded-2xl bg-black">
      <video ref={videoRef} muted playsInline className="h-full w-full object-cover" />
      <div aria-hidden="true" className="absolute inset-[14%] rounded-2xl border-2 border-white/80" />
    </div>
  );
};

export default QrScanner;
