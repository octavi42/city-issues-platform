"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Sheet } from "@silk-hq/components";
import Image from 'next/image';
import "@/components/examples/DetachedSheet/DetachedSheet.css";
import "@/components/examples/DetachedSheet/ExampleDetachedSheet.css";
import { useVisitorId } from '../hooks/useVisitorId';
import { useUserLocation } from '../hooks/useUserLocation';
import { analyzeImage } from '@/lib/services/visionService';

// Helper function to convert data URL to File object
function dataURLtoFile(dataUrl: string, filename: string): File {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

const CustomDetachedSheet = () => {
  const [presented, setPresented] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const visitorId = useVisitorId();
  const location = useUserLocation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const photoRef = useRef<HTMLCanvasElement>(null);
  const [hasPhoto, setHasPhoto] = useState(false);
  const [cameraStarted, setCameraStarted] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [imageData, setImageData] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Detect mobile and iOS
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userAgent = navigator.userAgent.toLowerCase();
      // Check if iOS device without storing the mobile check
      setIsIOS(/iphone|ipad|ipod/.test(userAgent));
    }
  }, []);
  
  // Log visitor ID when initialized
  useEffect(() => {
    if (visitorId) console.log('Visitor ID:', visitorId);
  }, [visitorId]);
  
  // Log user location when available
  useEffect(() => {
    if (location) console.log('User location:', location);
  }, [location]);

  // When sheet opens, require precise geolocation if not already granted
  const [, setRequireLocation] = useState(false);
  useEffect(() => {
    if (presented) {
      // if no location or only IP fallback, ask for geolocation
      if (!location || location.method !== 'geolocation') {
        setRequireLocation(true);
      } else {
        setRequireLocation(false);
      }
    }
  }, [presented, location]);

  // Trigger a geolocation permission request
  const requestGeolocation = () => {
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        () => {
          // on success, hook will update location
          setRequireLocation(false);
        },
        (err) => {
          console.warn('Geolocation request failed:', err);
          alert('Please enable location services in your browser settings to continue.');
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };
  
  const openCamera = async () => {
    try {
      setShowCamera(true);
      setPresented(true);
      setShowConfirmation(false);
      setImageData(null);
      
      if (cameraStarted) return;
      
      // Wait a bit to ensure DOM is ready - crucial for iOS Safari
      setTimeout(async () => {
        // On iOS/Safari, we need to make sure video element exists before requesting camera
        if (videoRef.current) {
          try {
            // iOS Safari needs specific constraints
            const constraints: MediaStreamConstraints = {
              video: {
                facingMode: 'environment',
                width: { ideal: 1280 },
                height: { ideal: 720 }
              },
              audio: false
            };
            
            console.log("Requesting camera with constraints:", constraints);
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            
            console.log("Camera stream obtained:", stream);
            const video = videoRef.current;
            
            if (video) {
              // Set all required attributes for iOS Safari
              video.setAttribute('autoplay', 'true');
              video.setAttribute('muted', 'true');
              video.setAttribute('playsinline', 'true');
              
              // Set srcObject
              video.srcObject = stream;
              
              // For iOS Safari, we need to call play() in response to a user gesture
              // and handle it slightly differently
              if (isIOS) {
                try {
                  await video.play();
                  console.log("iOS video playback started");
                  setCameraStarted(true);
                } catch (playErr: unknown) {
                  console.error("iOS video play error:", playErr);
                  alert("Please tap on the screen to activate the camera.");
                  
                  // Add a tap handler for iOS
                  const handleTap = async () => {
                    try {
                      await video.play();
                      console.log("iOS video playback started after tap");
                      setCameraStarted(true);
                      document.removeEventListener('touchend', handleTap);
                    } catch (err) {
                      console.error("Still can't play video after tap:", err);
                    }
                  };
                  
                  document.addEventListener('touchend', handleTap);
                }
              } else {
                // Non-iOS devices
                video.onloadedmetadata = () => {
                  console.log("Video metadata loaded");
                  video.play()
                    .then(() => {
                      console.log("Video playback started");
                      setCameraStarted(true);
                    })
                    .catch((err: unknown) => {
                      console.error("Error starting video playback:", err);
                    });
                };
              }
            }
          } catch (err: unknown) {
            console.error("Error accessing camera:", err);
            
            // More specific error message for permissions issues
            if (err && typeof err === 'object' && 'name' in err) {
              const errorObj = err as { name: string };
              if (errorObj.name === "NotAllowedError" || errorObj.name === "PermissionDeniedError") {
                if (isIOS) {
                  alert("Camera access was denied. On iOS, you need to allow camera access in Settings > Safari > Camera.");
                } else {
                  alert("Camera access was denied. Please allow camera access in your browser settings and try again.");
                }
              } else {
                const errorMessage = err instanceof Error ? err.message : "Unknown error";
                alert("Unable to access the camera: " + (errorMessage));
              }
            }
            setShowCamera(false);
          }
        }
      }, 100); // Short delay to ensure DOM is ready
    } catch (error: unknown) {
      console.error("Camera initialization error:", error);
      setShowCamera(false);
    }
  };
  
  const takePhoto = () => {
    const video = videoRef.current;
    const photo = photoRef.current;
    
    if (video && photo) {
      try {
        const ctx = photo.getContext('2d');
        if (ctx) {
          // Get video dimensions or use defaults
          const width = video.videoWidth || 640;
          const height = video.videoHeight || 480;
          
          // Set canvas size to match video dimensions
          photo.width = width;
          photo.height = height;
          
          // iOS Safari sometimes needs a different approach for drawing to canvas
          if (isIOS) {
            // For iOS, draw with explicit dimensions
            ctx.drawImage(video, 0, 0, width, height);
          } else {
            // Standard approach
            ctx.drawImage(video, 0, 0, photo.width, photo.height);
          }
          
          setHasPhoto(true);
          
          // Stop the camera stream
          const stream = video.srcObject as MediaStream;
          if (stream) {
            const tracks = stream.getTracks();
            tracks.forEach(track => track.stop());
            setCameraStarted(false);
          }
        }
      } catch (err: unknown) {
        console.error("Error capturing photo:", err);
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        alert("Failed to capture photo: " + errorMessage);
      }
    }
  };
  
  const closeCamera = () => {
    try {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        const tracks = stream.getTracks();
        tracks.forEach(track => {
          track.stop();
          console.log("Track stopped:", track.kind);
        });
        // Clear srcObject for iOS
        videoRef.current.srcObject = null;
        setCameraStarted(false);
      }
    } catch (err: unknown) {
      console.error("Error closing camera:", err);
    }
    setShowCamera(false);
    setHasPhoto(false);
  };
  
  const retakePhoto = () => {
    setHasPhoto(false);
    openCamera();
  };
  
  const savePhoto = () => {
    // Get photo data and return to the sheet view with the image
    const photo = photoRef.current;
    if (photo) {
      try {
        const photoData = photo.toDataURL('image/jpeg');
        setImageData(photoData);
        
        // Close camera but show confirmation UI
        closeCamera();
        setShowConfirmation(true);
        setPresented(true);
      } catch (err: unknown) {
        console.error("Error saving photo:", err);
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        alert("Failed to save photo: " + errorMessage);
        closeCamera();
      }
    }
  };
  
  const handleTakePhotoClick = () => {
    // Always try to open camera
    openCamera();
  };
  
  // Setup file input for the upload option
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPresented(true)

    const file = e.target.files?.[0];
    if (file) {
      // Here you would handle the uploaded file
      console.log("File uploaded:", file);
      
      // Read the file as a data URL and show confirmation
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImageData(result);
        setShowConfirmation(true);
        // Don't close the sheet
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSendImage = async () => {
    if (!imageData || !visitorId || !location) {
      setUploadError("Missing required data (image, user ID, or location)");
      return;
    }

    try {
      setIsUploading(true);
      setUploadError(null);
      
      // Convert data URL to File object
      const imageFile = dataURLtoFile(imageData, `photo-${Date.now()}.jpg`);
      
      // Get city and country info - in a real app, you might use a geocoding service
      // For now we'll use placeholder values
      const city = "Cluj-Napoca"; // This should come from geocoding the coordinates
      const country = "Romania";   // This should come from geocoding the coordinates
      
      // Prepare the request
      const request = {
        image: imageFile,
        user_id: visitorId,
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
          city: city,
          country: country
        }
      };
      
      // Send the image for analysis
      const response = await analyzeImage(request);
      console.log("Analysis response:", response);
      
      // Reset state and close sheet
      setImageData(null);
      setShowConfirmation(false);
      setIsUploading(false);
      setPresented(false); // Close the sheet on success
      
      // Show success message
      alert("Image uploaded successfully!");
    } catch (error) {
      console.error("Error uploading image:", error);
      setIsUploading(false);
      setUploadError(error instanceof Error ? error.message : "An error occurred during upload");
    }
  };

  return (
    <>
      <button
        onClick={() => setPresented(!presented)}
        className={`fixed bottom-8 right-8 w-14 h-14  rounded-full shadow-lg flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all duration-300 ease-in-out z-50 ${
          presented 
            ? 'bg-red-500 hover:bg-red-600 focus:ring-red-300 text-white' 
            : 'bg-[#97b9ff] hover:bg-blue-300 focus:ring-blue-300 text-white'
        }`}
        aria-label={presented ? "Close" : "Add"}
      >
        <div className={`transform transition-transform duration-300 ${presented ? 'rotate-45' : ''}`}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="w-8 h-8"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
        </div>
      </button>

      {/* Hidden file input for upload option */}
      <input 
        type="file"
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileUpload}
      />

      {/* Camera UI */}
      {showCamera && (
        <div className="fixed inset-0 bg-black z-[-100] flex flex-col">
          <div className="relative flex-grow">
            {!hasPhoto ? (
              <>
                <video 
                  ref={videoRef} 
                  className="absolute inset-0 h-full w-full object-cover"
                  autoPlay
                  playsInline
                  muted
                />
                {!cameraStarted && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-white text-lg bg-black bg-opacity-50 p-4 rounded-lg">
                      {isIOS ? "Tap to initialize camera..." : "Initializing camera..."}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <canvas 
                ref={photoRef} 
                className="absolute inset-0 h-full w-full object-cover"
              />
            )}
          </div>
          
          <div className="p-4 bg-gray-900 flex justify-between items-center">
            {!hasPhoto ? (
              <>
                <button 
                  onClick={closeCamera}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg"
                >
                  Cancel
                </button>
                <button 
                  onClick={takePhoto}
                  className="w-16 h-16 bg-white rounded-full border-4 border-gray-300 flex items-center justify-center"
                >
                  <div className="w-12 h-12 bg-white rounded-full" />
                </button>
                <div className="w-16"></div> {/* Empty space for alignment */}
              </>
            ) : (
              <>
                <button 
                  onClick={retakePhoto}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg"
                >
                  Retake
                </button>
                <button 
                  onClick={savePhoto}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg"
                >
                  Use Photo
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <Sheet.Root
        license="non-commercial"
        presented={presented}
        onPresentedChange={setPresented}
      >
        <Sheet.Portal>
          <Sheet.View
            className="DetachedSheet-view contentPlacement-bottom"
            contentPlacement="bottom"
            tracks="bottom"
            nativeEdgeSwipePrevention
          >
            <Sheet.Backdrop
              travelAnimation={{
                opacity: ({ progress }) => Math.min(progress * 0.2, 0.2),
              }}
              themeColorDimming="auto"
            />
            <Sheet.Content className="DetachedSheet-content">
              <div className="DetachedSheet-innerContent ExampleDetachedSheet-root">
                
                
                {showConfirmation && imageData ? (
                  <div className="p-4 flex flex-col items-center">
                    <h3 className="text-lg font-bold mb-3">Review Image</h3>
                    <div className="w-full h-64 mb-4 rounded-lg overflow-hidden relative">
                      <Image 
                        src={imageData} 
                        alt="Captured" 
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                    
                    {uploadError && (
                      <div className="w-full bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        <p>{uploadError}</p>
                      </div>
                    )}
                    
                    <div className="flex justify-between w-full">
                      <button
                        onClick={() => {
                          setShowConfirmation(false);
                          setImageData(null);
                        }}
                        className="bg-gray-300 text-gray-800 px-6 py-2 rounded-lg"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSendImage}
                        disabled={isUploading}
                        className={`px-6 py-2 rounded-lg ${
                          isUploading 
                            ? 'bg-gray-400 text-gray-800 cursor-not-allowed' 
                            : 'bg-blue-500 text-white hover:bg-blue-600'
                        }`}
                      >
                        {isUploading ? 'Uploading...' : 'Send Image'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>  {
                    // If location access is required, prompt user
                  }
                  {false ? (
                    <div className="p-4 flex flex-col items-center gap-4">
                      <p className="text-center text-gray-700">
                        To upload an image, please enable precise location access.
                      </p>
                      <button
                        onClick={requestGeolocation}
                        className="bg-[#085cdd] text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        Enable Location
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="ExampleDetachedSheet-information">
                        <Sheet.Title className="ExampleDetachedSheet-title">
                          Add New Content
                        </Sheet.Title>
                        <Sheet.Description className="ExampleDetachedSheet-description">
                          Choose how you want to add content
                        </Sheet.Description>
                      </div>
                      <div className="flex flex-col gap-4 p-4">
                        <button
                          className="bg-blue-500 text-white p-3 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors"
                          onClick={handleTakePhotoClick}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                          </svg>
                          Take a Photo
                        </button>
                        <button
                          className="bg-gray-200 text-gray-800 p-3 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-300 transition-colors"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a3 3 0 006 0V7a3 3 0 00-3-3zm5 3a5 5 0 00-10 0v4a5 5 0 0010 0V7z" clipRule="evenodd" />
                            <path d="M14 7a1 1 0 10-2 0v4a1 1 0 102 0V7z" />
                          </svg>
                          Upload Image
                        </button>
                      </div>
                    </>
                  )}
                  </>
                )}
              </div>
            </Sheet.Content>
          </Sheet.View>
        </Sheet.Portal>
      </Sheet.Root>
    </>
  );
};

export { CustomDetachedSheet }; 