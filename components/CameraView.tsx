import React, { useRef, useEffect, useState, useCallback } from 'react';
import Button from './common/Button';
import Icon from './common/Icon';

interface CameraViewProps {
  onCapture: (imageDataUrl: string) => void;
}

const CameraView: React.FC<CameraViewProps> = ({ onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCameraIndex, setSelectedCameraIndex] = useState(0);
  const [showGrid, setShowGrid] = useState(true);
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [flash, setFlash] = useState(false);
  const [levelAngle, setLevelAngle] = useState(0);
  const levelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const getDevices = async () => {
      try {
        // Request permission first to be able to enumerate devices with labels
        const tempStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        tempStream.getTracks().forEach(track => track.stop());
        
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');

        setCameras(videoDevices);
        if (videoDevices.length === 0) {
            setError("No camera found. Please ensure you have a camera connected and have granted permission.");
        }
      } catch (err) {
        console.error("Error enumerating devices: ", err);
        setError("Could not list cameras. Please grant camera permission in your browser settings.");
      }
    };
    getDevices();
  }, []);

  // Device orientation (horizon level) if available
  useEffect(() => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      const gamma = event.gamma || 0; // left-right tilt in degrees (-90 to 90)
      const clamped = Math.max(-15, Math.min(15, gamma));
      setLevelAngle(clamped);
    };
    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, []);

  useEffect(() => {
    if (cameras.length === 0) return;

    // Clean up previous stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }

    const getStream = async () => {
      try {
        const deviceId = cameras[selectedCameraIndex].deviceId;
        const constraints = {
          video: {
            deviceId: { exact: deviceId },
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          }
        };
        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = mediaStream;
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error("Error accessing camera: ", err);
        setError("Could not access the selected camera. Please check permissions and try again.");
      }
    };

    getStream();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameras, selectedCameraIndex]);

  const doCapture = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      const context = canvas.getContext('2d');
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Match the mirrored preview for a natural selfie experience
        const isMirrored = video.style.transform === 'scaleX(-1)';
        if (isMirrored) {
          context.translate(video.videoWidth, 0);
          context.scale(-1, 1);
        }
        
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        onCapture(dataUrl);
      }
    }
  }, [onCapture]);

  const handleCapture = useCallback(() => {
    if (timerEnabled) {
      setCountdown(3);
      let current = 3;
      const interval = window.setInterval(() => {
        current -= 1;
        if (current <= 0) {
          window.clearInterval(interval);
          setCountdown(null);
          setFlash(true);
          setTimeout(() => setFlash(false), 120);
          doCapture();
        } else {
          setCountdown(current);
        }
      }, 1000);
      return;
    }
    setFlash(true);
    setTimeout(() => setFlash(false), 120);
    doCapture();
  }, [timerEnabled, doCapture]);
  
  const handleSwitchCamera = () => {
    setSelectedCameraIndex(prev => (prev + 1) % cameras.length);
  };

  if (error) {
    return <div className="w-full h-full flex items-center justify-center p-4 bg-red-900/50 text-center">{error}</div>;
  }

  // Determine if camera feed should be mirrored. Typically, 'user' (front) facing cameras are mirrored.
  const isFrontCamera = cameras[selectedCameraIndex]?.label.toLowerCase().includes('front');

  // Update level indicator transform without inline JSX styles
  useEffect(() => {
    if (levelRef.current) {
      levelRef.current.style.transform = `translate(-50%, -50%) rotate(${levelAngle}deg)`;
    }
  }, [levelAngle]);
  
  return (
    <div className="w-full h-full relative bg-black">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`w-full h-full object-cover ${isFrontCamera ? 'mirror-x' : ''}`}
      />
      <canvas ref={canvasRef} className="hidden" />

      {/* Overlays */}
      {showGrid && <div className="grid-overlay-3x3" aria-hidden="true" />}
      <div ref={levelRef} className="level-indicator" aria-hidden="true" />
      {flash && <div className="absolute inset-0 bg-white/70" aria-hidden="true" />}
      {countdown !== null && (
        <div className="absolute inset-0 flex items-center justify-center text-white text-7xl font-black bg-black/20">
          {countdown}
        </div>
      )}

      {/* Top controls */}
      <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-end gap-2 bg-gradient-to-b from-black/40 to-transparent">
        <button
          onClick={() => setShowGrid((s) => !s)}
          className={`p-2 rounded-lg border ${showGrid ? 'bg-white/20 border-white/50' : 'bg-white/10 border-white/30'} hover:bg-white/20`}
          aria-label="Toggle grid"
        >
          <Icon type="grid" className="w-5 h-5 text-white" />
        </button>
        <button
          onClick={() => setTimerEnabled((t) => !t)}
          className={`p-2 rounded-lg border ${timerEnabled ? 'bg-white/20 border-white/50' : 'bg-white/10 border-white/30'} hover:bg-white/20`}
          aria-label="Toggle timer"
          title="3s timer"
        >
          <Icon type="timer" className="w-5 h-5 text-white" />
        </button>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/60 to-transparent flex justify-center items-center gap-8">
        <div className="w-16 h-16 flex items-center justify-center">
            {cameras.length > 1 && (
                <button
                    onClick={handleSwitchCamera}
                    className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full border-2 border-white/30 flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-blue-500/50 active:scale-95 transition-all duration-150 ease-in-out group hover:border-white/50"
                    aria-label="Switch Camera"
                >
                    <Icon type="switchCamera" className="w-6 h-6 text-white" />
                </button>
            )}
        </div>

        <button
          onClick={handleCapture}
          className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full border-4 border-white/50 focus:outline-none focus:ring-4 focus:ring-blue-500/50 active:scale-95 transition-all duration-150 ease-in-out group hover:border-white"
          aria-label="Take Picture"
        >
            <div className="w-full h-full rounded-full bg-white scale-75 group-hover:scale-90 transition-transform duration-150 ease-in-out"></div>
        </button>
        
        <div className="w-16 h-16" />
      </div>
    </div>
  );
};

export default CameraView;