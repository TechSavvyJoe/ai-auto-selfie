import React, { useRef, useEffect, useState, useCallback } from 'react';
import { PremiumButton, IconButton } from './common/PremiumButton';
import Icon from './common/Icon';

interface CameraViewProps {
  onCapture: (imageDataUrl: string) => void;
  onVideoCapture?: (videoBlob: Blob) => void;
}

interface AspectRatioGuideProps {
  aspectRatio: '1:1' | '4:3' | '16:9' | '9:16';
}

const AspectRatioGuide: React.FC<AspectRatioGuideProps> = ({ aspectRatio }) => {
  const getAspectClass = () => {
    switch (aspectRatio) {
      case '4:3':
        return 'aspect-video'; // Close approximation
      case '16:9':
        return 'aspect-video';
      case '9:16':
        return 'aspect-[9/16]';
      case '1:1':
      default:
        return 'aspect-square';
    }
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-8">
      <div className={`w-full h-full ${getAspectClass()} border-2 border-primary-400/50 rounded-lg shadow-inner`} />
    </div>
  );
};

const CameraView: React.FC<CameraViewProps> = ({ onCapture, onVideoCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCameraIndex, setSelectedCameraIndex] = useState(0);
  const [showGrid, setShowGrid] = useState(true);
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [flash, setFlash] = useState(false);
  const [levelAngle, setLevelAngle] = useState(0);
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '4:3' | '16:9' | '9:16'>('1:1');
  const [isVideoMode, setIsVideoMode] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [exposureCompensation, setExposureCompensation] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [maxZoom, setMaxZoom] = useState(1);
  const [isLandscape, setIsLandscape] = useState(false);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const levelRef = useRef<HTMLDivElement>(null);
  const [focusPoint, setFocusPoint] = useState<{ x: number; y: number } | null>(null);

  // Detect orientation changes
  useEffect(() => {
    const handleOrientationChange = () => {
      const isLand = window.innerWidth > window.innerHeight;
      setIsLandscape(isLand);
    };
    
    handleOrientationChange(); // Check on mount
    window.addEventListener('resize', handleOrientationChange);
    window.addEventListener('orientationchange', handleOrientationChange);
    
    return () => {
      window.removeEventListener('resize', handleOrientationChange);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

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
        const constraints: MediaStreamConstraints = {
          video: {
            deviceId: { exact: deviceId },
            width: { ideal: 3840, min: 1920 }, // 4K ideal, 1080p minimum
            height: { ideal: 2160, min: 1080 },
            frameRate: { ideal: 60, min: 30 },
            facingMode: cameras[selectedCameraIndex].label.toLowerCase().includes('front') ? 'user' : 'environment',
            // Advanced constraints for better quality
            aspectRatio: { ideal: 16/9 },
            focusMode: 'continuous',
            exposureMode: 'continuous',
            whiteBalanceMode: 'continuous',
          } as MediaTrackConstraints
        };
  const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        
        // Apply additional track settings for enhanced quality
        const videoTrack = mediaStream.getVideoTracks()[0];
        if (videoTrack) {
          const capabilities = videoTrack.getCapabilities();
          const settings: any = {};
          
          // Set highest resolution available
          if (capabilities.width && capabilities.height) {
            settings.width = capabilities.width.max || 3840;
            settings.height = capabilities.height.max || 2160;
          }
          
          // Enable HDR if supported
          if ('exposureMode' in capabilities) {
            settings.exposureMode = 'continuous';
          }
          
          // Set focus mode to continuous if supported
          if ('focusMode' in capabilities) {
            // @ts-ignore Experimental
            settings.focusMode = 'continuous';
          }
          
          // Detect max zoom capability
          if ('zoom' in capabilities && typeof capabilities.zoom === 'object') {
            const zoomCap = capabilities.zoom as { max?: number; min?: number };
            setMaxZoom(zoomCap.max || 1);
          }
          
          try {
            await videoTrack.applyConstraints(settings);
          } catch (e) {
            console.warn('Could not apply advanced constraints:', e);
          }

          // Attempt to set continuous autofocus explicitly
          try {
            // @ts-ignore Experimental
            await videoTrack.applyConstraints({ advanced: [{ focusMode: 'continuous' }] });
          } catch (e) {
            // Ignore if not supported
          }
        }
        
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
        // Use higher resolution for better quality
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Mirror front camera captures to match preview
        const currentIsFront = cameras[selectedCameraIndex]?.label.toLowerCase().includes('front');
        if (currentIsFront) {
          context.translate(video.videoWidth, 0);
          context.scale(-1, 1);
        }
        
        // Enable image smoothing for better quality
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = 'high';
        
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        
        // Use PNG for lossless quality or high-quality JPEG
        const dataUrl = canvas.toDataURL('image/png');
        onCapture(dataUrl);
      }
    }
  }, [onCapture, cameras, selectedCameraIndex]);

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

  // Tap-to-focus handler
  const handleTapToFocus = useCallback(async (e: React.MouseEvent<HTMLDivElement>) => {
    if (!streamRef.current || !videoRef.current) return;
    const videoTrack = streamRef.current.getVideoTracks()[0];
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width; // 0..1
    const y = (e.clientY - rect.top) / rect.height; // 0..1
    setFocusPoint({ x, y });

    // Show focus ring briefly
    setTimeout(() => setFocusPoint(null), 1200);

    try {
      // Try single-shot focus at point of interest if supported
      // @ts-ignore Experimental constraints
      await videoTrack.applyConstraints({ advanced: [{ focusMode: 'single-shot', pointsOfInterest: [{ x, y }] }] });
      // Revert to continuous after a moment
      setTimeout(async () => {
        try {
          // @ts-ignore Experimental
          await videoTrack.applyConstraints({ advanced: [{ focusMode: 'continuous' }] });
        } catch {}
      }, 1500);
    } catch (err) {
      // Fallback: try continuous again
      try {
        // @ts-ignore Experimental
        await videoTrack.applyConstraints({ advanced: [{ focusMode: 'continuous' }] });
      } catch {}
    }
  }, []);

  const startVideoRecording = useCallback(() => {
    if (!streamRef.current) return;

    recordedChunksRef.current = [];
    const options: MediaRecorderOptions = {
      mimeType: 'video/webm;codecs=vp9',
      videoBitsPerSecond: 8000000, // 8 Mbps for higher quality
    };

    // Fallback if vp9 not supported
    if (!MediaRecorder.isTypeSupported(options.mimeType!)) {
      options.mimeType = 'video/webm;codecs=vp8';
      options.videoBitsPerSecond = 5000000; // 5 Mbps for vp8
    }
    
    // Final fallback
    if (!MediaRecorder.isTypeSupported(options.mimeType!)) {
      options.mimeType = 'video/webm';
      options.videoBitsPerSecond = 5000000;
    }

    const mediaRecorder = new MediaRecorder(streamRef.current, options);

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const videoBlob = new Blob(recordedChunksRef.current, {
        type: 'video/webm',
      });
      onVideoCapture?.(videoBlob);
      setIsRecording(false);
      setRecordingTime(0);
    };

    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start();
    setIsRecording(true);

    // Start recording timer
    recordingIntervalRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  }, [onVideoCapture]);

  const stopVideoRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  }, [isRecording]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, []);

  if (error) {
    return <div className="w-full h-full flex items-center justify-center p-4 bg-red-900/50 text-center">{error}</div>;
  }

  // Apply zoom changes
  useEffect(() => {
    if (!streamRef.current) return;
    const videoTrack = streamRef.current.getVideoTracks()[0];
    if (videoTrack && 'zoom' in videoTrack.getCapabilities()) {
      videoTrack.applyConstraints({
        // @ts-ignore - zoom is not in standard types yet
        advanced: [{ zoom: zoomLevel }]
      }).catch(e => console.warn('Zoom not applied:', e));
    }
  }, [zoomLevel]);

  // Apply exposure compensation if supported
  useEffect(() => {
    if (!streamRef.current) return;
    try {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      const caps = videoTrack.getCapabilities() as any;
      if (caps && 'exposureCompensation' in caps) {
        // @ts-ignore experimental
        videoTrack.applyConstraints({ advanced: [{ exposureCompensation }] }).catch(() => {});
      }
    } catch {}
  }, [exposureCompensation]);

  // Determine if camera feed should be mirrored. Typically, 'user' (front) facing cameras are mirrored.
  const isFrontCamera = cameras[selectedCameraIndex]?.label.toLowerCase().includes('front');

  // Update level indicator transform without inline JSX styles
  useEffect(() => {
    if (levelRef.current) {
      levelRef.current.style.transform = `translate(-50%, -50%) rotate(${levelAngle}deg)`;
    }
  }, [levelAngle]);
  
  return (
    <div className="w-full h-full relative bg-black overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`w-full h-full object-cover ${isFrontCamera ? 'mirror-x' : ''}`}
      />
      {/* Tap to focus overlay */}
      <div
        className="absolute inset-0"
        onClick={handleTapToFocus}
        aria-label="Tap to focus"
        role="button"
        title="Tap to focus"
      />
      {focusPoint && (
        <div
          className="absolute w-16 h-16 rounded-full border-2 border-primary-300 shadow-glow pointer-events-none animate-ping-slow"
          style={{ left: `${focusPoint.x * 100}%`, top: `${focusPoint.y * 100}%`, transform: 'translate(-50%, -50%)' }}
          aria-hidden="true"
        />
      )}
      <canvas ref={canvasRef} className="hidden" />

      {/* Overlays */}
      {showGrid && <div className="grid-overlay-3x3" aria-hidden="true" />}

      {/* Aspect Ratio Guide */}
      <AspectRatioGuide aspectRatio={aspectRatio} />

      <div ref={levelRef} className="level-indicator" aria-hidden="true" />
      {flash && <div className="absolute inset-0 bg-white/70" aria-hidden="true" />}
      {countdown !== null && (
        <div className="absolute inset-0 flex items-center justify-center text-white text-7xl font-black bg-black/20">
          {countdown}
        </div>
      )}

      {/* LANDSCAPE LAYOUT */}
      {isLandscape ? (
        <>
          {/* Left side controls */}
          <div className="absolute left-0 top-0 bottom-0 p-4 flex flex-col justify-between bg-gradient-to-r from-black/60 via-black/20 to-transparent backdrop-blur-sm max-w-xs">
            {/* Top controls */}
            <div className="flex flex-col gap-3">
              {/* Aspect Ratio Selector */}
              <div className="flex flex-col gap-2 glass rounded-xl p-2 shadow-lg bg-white/5 backdrop-blur-md border border-white/10">
                {(['1:1', '4:3', '16:9', '9:16'] as const).map((ratio) => (
                  <button
                    key={ratio}
                    onClick={() => setAspectRatio(ratio)}
                    className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                      aspectRatio === ratio
                        ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg scale-105 shadow-primary-500/30'
                        : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                    }`}
                    title={`Aspect ratio ${ratio}`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-2">
                <IconButton
                  icon={<Icon type="grid" className="w-5 h-5" />}
                  variant={showGrid ? "primary" : "secondary"}
                  size="md"
                  tooltip="Toggle grid overlay"
                  onClick={() => setShowGrid((s) => !s)}
                  fullWidth
                />
                <IconButton
                  icon={<Icon type="timer" className="w-5 h-5" />}
                  variant={timerEnabled ? "primary" : "secondary"}
                  size="md"
                  tooltip="3s countdown timer"
                  onClick={() => setTimerEnabled((t) => !t)}
                  fullWidth
                />
                <PremiumButton
                  variant={showAdvancedSettings ? "primary" : "secondary"}
                  size="sm"
                  icon={<span className="text-lg">⚙️</span>}
                  onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                  className="text-sm"
                  fullWidth
                >
                  Settings
                </PremiumButton>
              </div>

              {/* Advanced Settings Panel */}
              {showAdvancedSettings && (
                <div className="glass rounded-xl p-3 shadow-xl space-y-3 animate-in slide-in-from-left duration-300 bg-gradient-to-br from-white/10 to-white/5 border border-white/20 backdrop-blur-md">
                  {/* Exposure Compensation */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs text-white/90 font-semibold">
                        ✨ Exposure
                      </label>
                      <span className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-600">
                        {exposureCompensation > 0 ? '+' : ''}{exposureCompensation.toFixed(1)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="-3"
                      max="3"
                      step="0.5"
                      value={exposureCompensation}
                      onChange={(e) => setExposureCompensation(parseFloat(e.target.value))}
                      className="w-full h-2 bg-gradient-to-r from-gray-700 to-white/30 rounded-full appearance-none cursor-pointer accent-primary-500"
                      aria-label="Exposure compensation"
                      title={`Exposure: ${exposureCompensation.toFixed(1)}`}
                    />
                  </div>

                  {/* Zoom Control */}
                  {maxZoom > 1 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs text-white/90 font-semibold">
                          🔍 Zoom
                        </label>
                        <span className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-600">
                          {zoomLevel.toFixed(1)}x
                        </span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max={maxZoom}
                        step="0.1"
                        value={zoomLevel}
                        onChange={(e) => setZoomLevel(parseFloat(e.target.value))}
                        className="w-full h-2 bg-gradient-to-r from-gray-700 to-white/30 rounded-full appearance-none cursor-pointer accent-primary-500"
                        aria-label="Zoom level"
                        title={`Zoom: ${zoomLevel.toFixed(1)}x`}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom mode toggle */}
            <div className="flex flex-col gap-2">
              <PremiumButton
                variant={isVideoMode ? "danger" : "primary"}
                size="md"
                icon={isVideoMode ? <span className="text-lg">🎥</span> : <span className="text-lg">📷</span>}
                onClick={() => setIsVideoMode(!isVideoMode)}
                fullWidth
              >
                {isVideoMode ? 'Video' : 'Photo'}
              </PremiumButton>
            </div>
          </div>

          {/* Right side - Shutter & Switch */}
          <div className="absolute right-0 top-0 bottom-0 p-4 flex flex-col justify-center items-center gap-6 bg-gradient-to-l from-black/60 via-black/20 to-transparent backdrop-blur-sm">
            {/* Switch Camera Button */}
            {cameras.length > 1 && (
              <button
                onClick={handleSwitchCamera}
                className="w-14 h-14 rounded-full flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-primary-500/50 active:scale-90 transition-all duration-200 group shadow-2xl bg-gradient-to-br from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold text-lg hover:shadow-lg hover:shadow-primary-500/40"
                aria-label="Switch Camera"
                title={`Switch camera (${cameras.length} available)`}
              >
                <Icon type="switchCamera" className="w-6 h-6 text-white group-hover:text-primary-200 transition-colors" />
              </button>
            )}

            {/* Capture/Record Button - CENTER RIGHT */}
            {isVideoMode ? (
              <button
                onClick={isRecording ? stopVideoRecording : startVideoRecording}
                className={`w-20 h-20 rounded-full border-4 focus:outline-none focus:ring-4 focus:ring-red-500/50 active:scale-90 transition-all duration-200 group shadow-2xl ${
                  isRecording
                    ? 'bg-gradient-to-br from-red-500 to-red-600 border-red-400 hover:from-red-600 hover:to-red-700 hover:shadow-lg hover:shadow-red-500/40'
                    : 'glass border-white hover:border-primary-400 hover:bg-white/20 hover:shadow-lg hover:shadow-primary-500/20'
                }`}
                aria-label={isRecording ? 'Stop recording' : 'Start recording'}
                title={isRecording ? 'Stop recording (spacebar)' : 'Start recording (spacebar)'}
              >
                {isRecording ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-3 h-3 bg-white rounded-sm animate-pulse"></div>
                    <div className="w-3 h-3 bg-white rounded-sm animate-pulse recording-pulse-delayed"></div>
                  </div>
                ) : (
                  <div className="w-full h-full rounded-full bg-white scale-75 group-hover:scale-80 transition-transform duration-200 shadow-glow"></div>
                )}
              </button>
            ) : (
              <button
                onClick={handleCapture}
                className="w-20 h-20 rounded-full border-4 border-white focus:outline-none focus:ring-4 focus:ring-primary-500/50 active:scale-90 transition-all duration-200 group bg-gradient-to-br from-primary-400 to-primary-500 hover:from-primary-500 hover:to-primary-600 shadow-2xl hover:shadow-lg hover:shadow-primary-500/40"
                aria-label="Take Picture"
                title="Take photo (spacebar)"
              >
                <div className="w-full h-full rounded-full bg-white/90 scale-75 group-hover:scale-80 transition-transform duration-200 shadow-lg"></div>
              </button>
            )}

            {/* Zoom quick controls (if available) */}
            {maxZoom > 1 && (
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setZoomLevel(Math.min(maxZoom, zoomLevel + 0.5))}
                  className="w-10 h-10 rounded-full glass flex items-center justify-center text-white font-bold hover:bg-white/20 active:scale-90 transition-all"
                  aria-label="Zoom in"
                >
                  +
                </button>
                <button
                  onClick={() => setZoomLevel(Math.max(1, zoomLevel - 0.5))}
                  className="w-10 h-10 rounded-full glass flex items-center justify-center text-white font-bold hover:bg-white/20 active:scale-90 transition-all"
                  aria-label="Zoom out"
                >
                  −
                </button>
              </div>
            )}
          </div>


          {/* Recording indicator - top center */}
          {isRecording && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 glass bg-red-600/90 text-white px-5 py-2.5 rounded-full flex items-center gap-2.5 shadow-xl animate-pulse-slow">
              <div className="w-2.5 h-2.5 bg-white rounded-full shadow-glow"></div>
              <span className="text-sm font-bold">{Math.floor(recordingTime / 60)}:{String(recordingTime % 60).padStart(2, '0')}</span>
            </div>
          )}
        </>
      ) : (
        /* PORTRAIT LAYOUT - Original */
        <>
          {/* Top controls */}
          <div className="absolute top-0 left-0 right-0 p-4 flex flex-col gap-3 bg-gradient-to-b from-black/60 via-black/20 to-transparent backdrop-blur-sm" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 0.75rem)' }}>
            {/* Aspect Ratio Selector */}
            <div className="flex gap-2 glass rounded-xl p-2 w-fit shadow-lg bg-white/5 backdrop-blur-md border border-white/10">
              {(['1:1', '4:3', '16:9', '9:16'] as const).map((ratio) => (
                <button
                  key={ratio}
                  onClick={() => setAspectRatio(ratio)}
                  className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                    aspectRatio === ratio
                      ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg scale-105 shadow-primary-500/30'
                      : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                  }`}
                  title={`Aspect ratio ${ratio}`}
                >
                  {ratio}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between gap-2">
              <PremiumButton
                variant={showAdvancedSettings ? "primary" : "secondary"}
                size="sm"
                icon={<span className="text-lg">⚙️</span>}
                onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                className="text-sm"
              >
                Settings
              </PremiumButton>

              <div className="flex items-center justify-end gap-2">
                <IconButton
                  icon={<Icon type="grid" className="w-5 h-5" />}
                  variant={showGrid ? "primary" : "secondary"}
                  size="md"
                  tooltip="Toggle grid overlay"
                  onClick={() => setShowGrid((s) => !s)}
                />
                <IconButton
                  icon={<Icon type="timer" className="w-5 h-5" />}
                  variant={timerEnabled ? "primary" : "secondary"}
                  size="md"
                  tooltip="3s countdown timer"
                  onClick={() => setTimerEnabled((t) => !t)}
                />
              </div>
            </div>

            {/* Advanced Settings Panel */}
            {showAdvancedSettings && (
              <div className="glass rounded-xl p-4 shadow-xl space-y-4 animate-in slide-in-from-top duration-300 bg-gradient-to-br from-white/10 to-white/5 border border-white/20 backdrop-blur-md">
                {/* Exposure Compensation */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-white/90 font-semibold">
                      ✨ Exposure
                    </label>
                    <span className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-600">
                      {exposureCompensation > 0 ? '+' : ''}{exposureCompensation.toFixed(1)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-3"
                    max="3"
                    step="0.5"
                    value={exposureCompensation}
                    onChange={(e) => setExposureCompensation(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gradient-to-r from-gray-700 to-white/30 rounded-full appearance-none cursor-pointer accent-primary-500"
                    aria-label="Exposure compensation"
                    title={`Exposure: ${exposureCompensation.toFixed(1)}`}
                  />
                  <div className="text-xs text-white/60 flex justify-between mt-2">
                    <span>🌙 Dark</span>
                    <span>☀️ Bright</span>
                  </div>
                </div>

                {/* Zoom Control in Portrait */}
                {maxZoom > 1 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm text-white/90 font-semibold">
                        🔍 Zoom
                      </label>
                      <span className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-600">
                        {zoomLevel.toFixed(1)}x
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max={maxZoom}
                      step="0.1"
                      value={zoomLevel}
                      onChange={(e) => setZoomLevel(parseFloat(e.target.value))}
                      className="w-full h-2 bg-gradient-to-r from-gray-700 to-white/30 rounded-full appearance-none cursor-pointer accent-primary-500"
                      aria-label="Zoom level"
                      title={`Zoom: ${zoomLevel.toFixed(1)}x`}
                    />
                  </div>
                )}

                {/* Quick presets */}
                <div className="grid grid-cols-3 gap-2 pt-2">
                  <PremiumButton
                    variant={exposureCompensation === 0 ? "primary" : "secondary"}
                    size="sm"
                    onClick={() => setExposureCompensation(0)}
                  >
                    Reset
                  </PremiumButton>
                  <PremiumButton
                    variant={exposureCompensation === -1.5 ? "primary" : "secondary"}
                    size="sm"
                    onClick={() => setExposureCompensation(-1.5)}
                  >
                    Dark
                  </PremiumButton>
                  <PremiumButton
                    variant={exposureCompensation === 1.5 ? "primary" : "secondary"}
                    size="sm"
                    onClick={() => setExposureCompensation(1.5)}
                  >
                    Bright
                  </PremiumButton>
                </div>
              </div>
            )}
          </div>

          {/* Recording indicator */}
          {isRecording && (
            <div className="absolute top-20 left-1/2 transform -translate-x-1/2 glass bg-red-600/90 text-white px-5 py-2.5 rounded-full flex items-center gap-2.5 shadow-xl animate-pulse-slow">
              <div className="w-2.5 h-2.5 bg-white rounded-full shadow-glow"></div>
              <span className="text-sm font-bold">{Math.floor(recordingTime / 60)}:{String(recordingTime % 60).padStart(2, '0')}</span>
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/90 via-black/50 to-transparent backdrop-blur-md flex justify-center items-center gap-6 md:gap-10">
            {/* Mode Toggle */}
            <div className="w-20 h-16 flex items-center justify-center">
              <PremiumButton
                variant={isVideoMode ? "danger" : "primary"}
                size="md"
                icon={isVideoMode ? <span className="text-lg">🎥</span> : <span className="text-lg">📷</span>}
                onClick={() => setIsVideoMode(!isVideoMode)}
                className="whitespace-nowrap"
              >
                {isVideoMode ? 'Video' : 'Photo'}
              </PremiumButton>
            </div>

            {/* Switch Camera Button */}
            <div className="w-20 h-20 flex items-center justify-center">
              {cameras.length > 1 && (
                <button
                  onClick={handleSwitchCamera}
                  className="w-16 h-16 rounded-full flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-primary-500/50 active:scale-90 transition-all duration-200 group shadow-2xl bg-gradient-to-br from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold text-lg hover:shadow-lg hover:shadow-primary-500/40"
                  aria-label="Switch Camera"
                  title={`Switch camera (${cameras.length} available)`}
                >
                  <Icon type="switchCamera" className="w-7 h-7 text-white group-hover:text-primary-200 transition-colors" />
                </button>
              )}
            </div>

            {/* Capture/Record Button */}
            {isVideoMode ? (
              <button
                onClick={isRecording ? stopVideoRecording : startVideoRecording}
                className={`w-24 h-24 rounded-full border-4 focus:outline-none focus:ring-4 focus:ring-red-500/50 active:scale-90 transition-all duration-200 group shadow-2xl ${
                  isRecording
                    ? 'bg-gradient-to-br from-red-500 to-red-600 border-red-400 hover:from-red-600 hover:to-red-700 hover:shadow-lg hover:shadow-red-500/40'
                    : 'glass border-white hover:border-primary-400 hover:bg-white/20 hover:shadow-lg hover:shadow-primary-500/20'
                }`}
                aria-label={isRecording ? 'Stop recording' : 'Start recording'}
                title={isRecording ? 'Stop recording (spacebar)' : 'Start recording (spacebar)'}
              >
                {isRecording ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-3 h-3 bg-white rounded-sm animate-pulse"></div>
                    <div className="w-3 h-3 bg-white rounded-sm animate-pulse recording-pulse-delayed"></div>
                  </div>
                ) : (
                  <div className="w-full h-full rounded-full bg-white scale-75 group-hover:scale-80 transition-transform duration-200 shadow-glow"></div>
                )}
              </button>
            ) : (
              <button
                onClick={handleCapture}
                className="w-24 h-24 rounded-full border-4 border-white focus:outline-none focus:ring-4 focus:ring-primary-500/50 active:scale-90 transition-all duration-200 group bg-gradient-to-br from-primary-400 to-primary-500 hover:from-primary-500 hover:to-primary-600 shadow-2xl hover:shadow-lg hover:shadow-primary-500/40"
                aria-label="Take Picture"
                title="Take photo (spacebar)"
              >
                <div className="w-full h-full rounded-full bg-white/90 scale-75 group-hover:scale-80 transition-transform duration-200 shadow-lg"></div>
              </button>
            )}

            <div className="w-20 h-16" />
          </div>
        </>
      )}

      <style>{`
        .recording-pulse-delayed {
          animation-delay: 100ms;
        }
      `}</style>
    </div>
  );
};

export default React.memo(CameraView);
