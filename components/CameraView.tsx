import React, { useRef, useEffect, useState, useCallback } from 'react';
import Button from './common/Button';
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
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
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
          
          // Set focus mode
          if ('focusMode' in capabilities) {
            settings.focusMode = 'continuous';
          }
          
          try {
            await videoTrack.applyConstraints(settings);
          } catch (e) {
            console.warn('Could not apply advanced constraints:', e);
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
        
        // Match the mirrored preview for a natural selfie experience
        const isMirrored = video.style.transform === 'scaleX(-1)';
        if (isMirrored) {
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

      {/* Aspect Ratio Guide */}
      <AspectRatioGuide aspectRatio={aspectRatio} />

      <div ref={levelRef} className="level-indicator" aria-hidden="true" />
      {flash && <div className="absolute inset-0 bg-white/70" aria-hidden="true" />}
      {countdown !== null && (
        <div className="absolute inset-0 flex items-center justify-center text-white text-7xl font-black bg-black/20">
          {countdown}
        </div>
      )}

      {/* Top controls */}
      <div className="absolute top-0 left-0 right-0 p-4 flex flex-col gap-3 bg-gradient-to-b from-black/60 via-black/20 to-transparent backdrop-blur-sm">
        {/* Aspect Ratio Selector */}
        <div className="flex gap-2 glass rounded-xl p-2 w-fit shadow-lg">
          {(['1:1', '4:3', '16:9', '9:16'] as const).map((ratio) => (
            <button
              key={ratio}
              onClick={() => setAspectRatio(ratio)}
              className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                aspectRatio === ratio
                  ? 'bg-white/30 text-white shadow-md scale-105'
                  : 'bg-transparent text-white/70 hover:bg-white/10 hover:text-white'
              }`}
              title={`Aspect ratio ${ratio}`}
            >
              {ratio}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between gap-2">
          <button
            onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
            className="px-3 py-2 text-sm font-semibold glass rounded-xl text-white transition-all duration-200 hover:bg-white/15 active:scale-95 shadow-md"
            aria-label="Toggle advanced settings"
            title="Advanced camera settings"
          >
            ⚙️ Settings
          </button>

          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => setShowGrid((s) => !s)}
              className={`p-2.5 rounded-xl transition-all duration-200 active:scale-95 shadow-md ${
                showGrid ? 'glass bg-white/20' : 'glass hover:bg-white/15'
              }`}
              aria-label="Toggle grid"
            >
              <Icon type="grid" className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={() => setTimerEnabled((t) => !t)}
              className={`p-2.5 rounded-xl transition-all duration-200 active:scale-95 shadow-md ${
                timerEnabled ? 'glass bg-white/20' : 'glass hover:bg-white/15'
              }`}
              aria-label="Toggle timer"
              title="3s timer"
            >
              <Icon type="timer" className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Advanced Settings Panel */}
        {showAdvancedSettings && (
          <div className="glass rounded-xl p-4 shadow-xl space-y-4 animate-in slide-in-from-top duration-300">
            {/* Exposure Compensation */}
            <div>
              <label className="text-sm text-white font-semibold block mb-2">
                Exposure: {exposureCompensation > 0 ? '+' : ''}{exposureCompensation}
              </label>
              <input
                type="range"
                min="-3"
                max="3"
                step="0.5"
                value={exposureCompensation}
                onChange={(e) => setExposureCompensation(parseFloat(e.target.value))}
                className="w-full h-2 bg-white/20 rounded-full appearance-none cursor-pointer accent-primary-500"
              />
              <div className="text-xs text-white/60 flex justify-between mt-2">
                <span>Dark</span>
                <span>Bright</span>
              </div>
            </div>

            {/* Quick presets */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setExposureCompensation(0)}
                className="px-3 py-2 text-sm bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-200 active:scale-95 font-medium"
                title="Reset exposure"
              >
                Reset
              </button>
              <button
                onClick={() => setExposureCompensation(-1.5)}
                className="px-3 py-2 text-sm bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-200 active:scale-95 font-medium"
                title="Darker"
              >
                Dark
              </button>
              <button
                onClick={() => setExposureCompensation(1.5)}
                className="px-3 py-2 text-sm bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-200 active:scale-95 font-medium"
                title="Brighter"
              >
                Bright
              </button>
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

      <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 via-black/40 to-transparent backdrop-blur-sm flex justify-center items-center gap-10">
        <div className="w-20 h-16 flex items-center justify-center">
          <button
            onClick={() => setIsVideoMode(!isVideoMode)}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 active:scale-95 shadow-lg ${
              isVideoMode
                ? 'glass bg-red-500/30 text-red-400 border-2 border-red-500/60'
                : 'glass text-white hover:bg-white/15'
            }`}
            aria-label="Toggle video mode"
            title="Switch to video mode"
          >
            {isVideoMode ? '🎥 Video' : '📷 Photo'}
          </button>
        </div>

        <div className="w-20 h-20 flex items-center justify-center">
            {cameras.length > 1 && (
                <button
                    onClick={handleSwitchCamera}
                    className="w-14 h-14 glass rounded-full flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-primary-500/50 active:scale-90 transition-all duration-200 group hover:bg-white/20 shadow-lg"
                    aria-label="Switch Camera"
                >
                    <Icon type="switchCamera" className="w-7 h-7 text-white group-hover:text-primary-300 transition-colors" />
                </button>
            )}
        </div>

        {isVideoMode ? (
          <button
            onClick={isRecording ? stopVideoRecording : startVideoRecording}
            className={`w-24 h-24 rounded-full border-4 focus:outline-none focus:ring-4 focus:ring-primary-500/50 active:scale-90 transition-all duration-200 group shadow-2xl ${
              isRecording
                ? 'bg-red-500/40 border-red-500 hover:border-red-400'
                : 'glass border-white hover:border-primary-400 hover:bg-white/20'
            }`}
            aria-label={isRecording ? 'Stop recording' : 'Start recording'}
          >
            {isRecording ? (
              <div className="w-full h-full rounded-full bg-red-500 scale-50 group-hover:scale-55 transition-transform duration-200 shadow-glow-lg"></div>
            ) : (
              <div className="w-full h-full rounded-full bg-white scale-75 group-hover:scale-80 transition-transform duration-200 shadow-glow"></div>
            )}
          </button>
        ) : (
          <button
            onClick={handleCapture}
            className="w-24 h-24 glass rounded-full border-4 border-white hover:border-primary-400 focus:outline-none focus:ring-4 focus:ring-primary-500/50 active:scale-90 transition-all duration-200 group hover:bg-white/20 shadow-2xl"
            aria-label="Take Picture"
          >
              <div className="w-full h-full rounded-full bg-white scale-75 group-hover:scale-80 transition-transform duration-200 shadow-glow"></div>
          </button>
        )}

        <div className="w-20 h-16" />
      </div>
    </div>
  );
};

export default React.memo(CameraView);