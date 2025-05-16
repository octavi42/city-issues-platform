"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { MapPin, CheckCircle, AlertCircle, Camera, RefreshCcw, Pencil, Check, X } from "lucide-react";
import { fetchUserPhotos, fetchUserById, updateUserName } from "@/lib/neo4j-queries";
import { useVisitorId } from "@/app/hooks/useVisitorId";
import Image from "next/image";
import React from "react";
import SheetOrBackButton from "./SheetOrBackButton";
import { Sheet } from "@silk-hq/components";
import { SheetDismissButton } from "../examples/_GenericComponents/SheetDismissButton/SheetDismissButton";
import { generateUsername } from "@/lib/utils";

// Custom hook to handle location status with proper browser detection and error handling
function useLocationStatus() {
    const [status, setStatus] = useState<'checking' | 'enabled' | 'disabled'>('checking');
    const [checkInProgress, setCheckInProgress] = useState(false);

    // Function to check geolocation permission
    const checkPermission = useCallback(() => {
        if (checkInProgress || typeof window === 'undefined') return;
        setCheckInProgress(true);
        setStatus('checking');
        console.log("Checking geolocation permission...");

        // Safety timeout to prevent UI from hanging on unresolved permission requests
        const timeoutId = setTimeout(() => {
            console.log("Geolocation check timed out");
            setStatus('disabled');
            setCheckInProgress(false);
        }, 10000);

        try {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        console.log("Geolocation permission granted:", position.coords);
                        setStatus('enabled');
                        setCheckInProgress(false);
                        clearTimeout(timeoutId);
                    },
                    (error) => {
                        console.log("Geolocation error:", error.code, error.message);
                        setStatus('disabled');
                        setCheckInProgress(false);
                        clearTimeout(timeoutId);
                    },
                    { 
                        enableHighAccuracy: false,
                        timeout: 5000,
                        maximumAge: 600000 // 10 minutes
                    }
                );
            } else {
                console.log("Geolocation not supported by browser");
                setStatus('disabled');
                setCheckInProgress(false);
                clearTimeout(timeoutId);
            }
        } catch (error) {
            console.error("Error checking geolocation permission:", error);
            setStatus('disabled');
            setCheckInProgress(false);
            clearTimeout(timeoutId);
        }
    }, [checkInProgress]);

    // Check permission on mount - but only on client side
    useEffect(() => {
        if (typeof window === 'undefined') return;
        setCheckInProgress(true);
        setStatus('checking');
        checkPermission();

        // Cleanup function
        return () => {
            setCheckInProgress(false);
        };
    }, [checkPermission]);

    return {
        isEnabled: status === 'enabled',
        isDisabled: status === 'disabled',
        isChecking: status === 'checking',
        checkPermission
    };
}

interface UserPhoto {
    photo_id: string;
    url?: string;
    title?: string;
    status: string;
    type: 'issue' | 'maintenance' | 'in_progress' | 'irrelevant';
    related_node_id?: string;
    irrelevant_reason?: string;
    irrelevant_confidence?: number;
}

const Account = ({ isIntercepted = false }: { isIntercepted: boolean }) => {
    const router = useRouter();
    const visitorId = useVisitorId();
    const [isVerified, setIsVerified] = useState(false);
    const [userPhotos, setUserPhotos] = useState<UserPhoto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [irrelevantSheetPhoto, setIrrelevantSheetPhoto] = useState<UserPhoto | null>(null);
    const [user, setUser] = useState<{ name?: string; user_id: string; created_at?: string } | null>(null);
    const [isEditingName, setIsEditingName] = useState(false);
    const [editedName, setEditedName] = useState("");
    const [isSavingName, setIsSavingName] = useState(false);
    
    // Use our custom location hook instead of managing location state directly
    const location = useLocationStatus();

    // Move loadUserPhotos outside useEffect so it can be reused
    const loadUserPhotos = useCallback(async () => {
        if (!visitorId) return;
        setIsLoading(true);
        try {
            const photos = await fetchUserPhotos(visitorId);
            setUserPhotos(photos);
            console.log("User photos:", photos);
        } catch (error) {
            console.error("Error fetching user photos:", error);
            setUserPhotos([]);
        } finally {
            setIsLoading(false);
        }
    }, [visitorId]);

    // Fetch user photos when visitor ID is available
    useEffect(() => {
        if (!visitorId) {
            // Keep loading state true if we're still waiting for visitor ID
            return;
        }
        loadUserPhotos();
    }, [visitorId, loadUserPhotos]);

    // Fetch and set user object for display
    useEffect(() => {
        async function fetchAndSetUser() {
            if (!visitorId || typeof visitorId !== 'string') return;
            const dbUser = await fetchUserById(visitorId);
            if (dbUser) {
                setUser(dbUser);
            } else {
                // If no user found, use localStorage or generate a username
                const username = localStorage.getItem('username') || generateUsername();
                localStorage.setItem('username', username);
                setUser({ user_id: visitorId, name: username });
            }
        }
        fetchAndSetUser();
    }, [visitorId]);

    // When user changes, update editedName
    useEffect(() => {
        setEditedName(user?.name || "");
    }, [user]);

    const handleVerify = () => {
        setIsVerified(true);
    };

    const handlePhotoClick = (photo: UserPhoto) => {
        if (photo.type === 'irrelevant') {
            setIrrelevantSheetPhoto(photo);
            return;
        }
        if (photo.type === 'issue' && photo.related_node_id) {
            router.push(`/issue/${photo.related_node_id}`, { scroll: false });
        } else if (photo.type === 'maintenance') {
            router.push(`/image/${photo.photo_id}`, { scroll: false });
        }
    };

    // Handler for saving the edited name
    const handleSaveName = async () => {
        if (!user || !visitorId || !editedName.trim()) return;
        setIsSavingName(true);
        try {
            await updateUserName(visitorId, editedName.trim());
            setUser(prev => prev ? { ...prev, name: editedName.trim() } : prev);
            setIsEditingName(false);
        } finally {
            setIsSavingName(false);
        }
    };

    // Helper to format the member since date
    function formatMemberSince(dateString?: string) {
        if (!dateString) return null;
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return null;
        return date.toLocaleString('default', { month: 'long', year: 'numeric' });
    }

    return (
        <div className="relative h-full overflow-auto px-6">
            <SheetOrBackButton
                isIntercepted={isIntercepted}
                className="fixed right-4 top-4 z-10 bg-white border border-gray-200 rounded-full p-2 hover:bg-gray-100 focus:none"
            />
            
            {/* Profile Section */}
            <div className="flex flex-col items-center mb-8 mt-8">
                <div className="w-24 h-24 rounded-full bg-[#F7F7F7] flex items-center justify-center text-2xl font-bold text-[#333] mb-4 relative">
                    {/* Use initials from username if available, else fallback */}
                    {user?.name ? user.name.split(/\s+/).map(word => word[0]).join('').slice(0,2).toUpperCase() : 'JD'}
                    <button
                        className="absolute top-1 right-1 bg-white rounded-full p-1 shadow hover:bg-gray-100 focus:outline-none"
                        onClick={() => setIsEditingName(true)}
                        aria-label="Edit profile name"
                        tabIndex={0}
                        type="button"
                    >
                        <Pencil size={18} className="text-gray-500" />
                    </button>
                </div>
                <div className="flex items-center gap-2">
                    {isEditingName ? (
                        <>
                            <input
                                className="text-4xl font-bold leading-tight mb-2 text-center border-b border-gray-300 focus:outline-none focus:border-blue-400 bg-transparent px-2"
                                value={editedName}
                                onChange={e => setEditedName(e.target.value)}
                                disabled={isSavingName}
                                maxLength={32}
                                style={{ width: Math.max(editedName.length, 8) + 'ch' }}
                            />
                            <button
                                className="ml-2 text-green-600 font-semibold disabled:opacity-50"
                                onClick={handleSaveName}
                                disabled={isSavingName || !editedName.trim()}
                                title="Save"
                                type="button"
                            >
                                <Check size={28} />
                            </button>
                            <button
                                className="ml-1 text-gray-500 font-semibold"
                                onClick={() => { setIsEditingName(false); setEditedName(user?.name || ""); }}
                                disabled={isSavingName}
                                title="Cancel"
                                type="button"
                            >
                                <X size={28} />
                            </button>
                        </>
                    ) : (
                        <>
                            <h1 className="text-4xl font-bold leading-tight mb-2 text-center">
                                {user?.name || 'Loading...'}
                            </h1>
                        </>
                    )}
                </div>
                {user?.created_at && formatMemberSince(user.created_at) && (
                    <p className="text-[0.9375rem] text-[#787575] mb-4 text-center">
                        Member since {formatMemberSince(user.created_at)}
                    </p>
                )}
                
                {!isVerified ? (
                    <button 
                        className="w-4/6 bg-[#97b9ff] text-white py-3 text-base font-semibold rounded-2xl border-none cursor-pointer flex items-center justify-center gap-2"
                        onClick={handleVerify}
                    >
                        <CheckCircle size={18} />
                        Verify Account
                    </button>
                ) : (
                    <div className="inline-block rounded-[1.875rem] py-2 px-4 text-[0.9375rem] font-medium bg-[#E6F0FF] text-[#075CDD] my-2">
                        <CheckCircle size={16} className="mr-1 align-text-bottom" />
                        Verified Account
                    </div>
                )}
            </div>

            {/* Location Services Section */}
            <div className="bg-[#F7F7F7] rounded-[1.875rem] p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <MapPin size={20} />
                    Location Services
                </h2>
                
                <p className="text-base leading-relaxed text-[#333] mb-6">
                    You need to enable location services to fully interact with the app features and 
                    report issues accurately.
                </p>
                
                <div className="flex justify-between items-center mb-4">
                    <span className="font-medium">Status</span>
                    <span className={`inline-block rounded-[1.875rem] py-2 px-4 text-[0.9375rem] font-medium ${
                        location.isEnabled 
                            ? 'bg-[#E6F0FF] text-[#075CDD]' 
                            : location.isChecking 
                                ? 'bg-[#FFF8E6] text-[#805E00]'
                                : 'bg-[#F7F7F7] text-[#787575]'
                    } my-2`}>
                        {location.isEnabled 
                            ? "Enabled" 
                            : location.isChecking 
                                ? "Checking..." 
                                : "Disabled"}
                    </span>
                </div>
                
                {/* Debug info - only visible in development environment */}
                {process.env.NODE_ENV === 'development' && (
                    <div className="text-xs p-2 bg-gray-100 rounded mb-4 font-mono">
                        <div>isEnabled: {location.isEnabled ? 'true' : 'false'}</div>
                        <div>isChecking: {location.isChecking ? 'true' : 'false'}</div>
                        <BrowserInfo />
                    </div>
                )}
                
                {!location.isEnabled && (
                    <button 
                        className={`w-full py-3 text-base font-semibold rounded-2xl border-none cursor-pointer flex items-center justify-center gap-2 ${
                            location.isChecking
                                ? 'bg-gray-400 text-gray-100' 
                                : 'bg-[#97b9ff] text-white hover:bg-[#7da7f8]'
                        }`}
                        onClick={location.checkPermission} 
                        disabled={location.isChecking}
                    >
                        <MapPin size={18} />
                        {location.isChecking ? 'Checking Location...' : 'Enable Location'}
                    </button>
                )}
            </div>

            {/* Reported Issues Section */}
            <div className="mt-6 mb-20">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <AlertCircle size={20} />
                    My reports
                </h2>
                
                {isLoading ? (
                    <div className="text-center p-8 text-[#787575] bg-[#F7F7F7] rounded-[1.875rem] mt-4">
                        {!visitorId 
                            ? "Identifying your account..." 
                            : "Loading your reported items..."}
                    </div>
                ) : userPhotos.length > 0 ? (
                    <div>
                        {userPhotos.map(photo => (
                            <div 
                                key={photo.photo_id} 
                                className={`bg-white rounded-2xl p-4 px-6 mb-4 border border-[#E0E0E0] flex justify-between items-center ${
                                    photo.type !== 'in_progress' ? "cursor-pointer hover:shadow-md transition-shadow" : ""
                                }`}
                                onClick={() => handlePhotoClick(photo)}
                            >
                                <div className="flex items-center gap-3">
                                    {photo.url ? (
                                        <div className="w-12 h-12 rounded-md overflow-hidden">
                                            <Image src={photo.url} alt={photo.title || 'Reported item'} width={48} height={48} className="w-full h-full object-cover" />
                                        </div>
                                    ) : (
                                        <div className="w-12 h-12 rounded-md bg-[#F7F7F7] flex items-center justify-center">
                                            <Camera size={20} className="text-[#787575]" />
                                        </div>
                                    )}
                                    <span className="text-base font-medium">{photo.title || 'Reported Item'}</span>
                                </div>
                                <span className={`inline-block py-1 px-3 rounded-2xl text-sm font-medium ${
                                    photo.type === "issue" && photo.related_node_id
                                        ? "bg-[#E6F0FF] text-[#075CDD]"
                                        : photo.type === "maintenance" && photo.related_node_id
                                            ? "bg-[#E8F5E9] text-[#3B7B3B]"
                                            : "bg-[#FFE6E6] text-[#D10000]"
                                }`}>
                                    {photo.type === "issue" && photo.related_node_id
                                        ? "Issue"
                                        : photo.type === "maintenance" && photo.related_node_id
                                            ? "Maintenance"
                                            : "Irrelevant"}
                                </span>
                            </div>
                        ))}
                        
                        {/* Refresh Button */}
                        <button 
                            className={`w-full bg-white text-[#333] py-3 text-base font-semibold rounded-2xl border border-[#E0E0E0] cursor-pointer flex items-center justify-center gap-2 ${isLoading ? 'opacity-60 pointer-events-none' : ''}`}
                            onClick={loadUserPhotos}
                            disabled={isLoading}
                        >
                            <RefreshCcw size={18} className={isLoading ? 'animate-spin' : ''} />
                            {isLoading ? 'Refreshing...' : 'Refresh'}
                        </button>
                    </div>
                ) : (
                    <div className="text-center p-8 text-[#787575] bg-[#F7F7F7] rounded-[1.875rem] mt-4">
                        <AlertCircle size={24} className="mx-auto mb-2" />
                        <p>No reported issues yet</p>
                        
                        <button 
                            className="w-full bg-[#97b9ff] text-white py-3 text-base font-semibold rounded-2xl border-none cursor-pointer flex items-center justify-center gap-2 mt-4"
                            onClick={() => router.push('/report')}
                        >
                            Report an Issue
                        </button>
                    </div>
                )}
            </div>

            {irrelevantSheetPhoto && (
                <Sheet.Root
                    license="non-commercial"
                    presented={!!irrelevantSheetPhoto}
                    onPresentedChange={(open) => {
                        if (!open) setIrrelevantSheetPhoto(null);
                    }}
                >
                    <Sheet.Portal>
                        <Sheet.View
                            contentPlacement="center"
                            tracks="top"
                            nativeEdgeSwipePrevention={true}
                            style={{ zIndex: 50, height: 'calc(100svh + 60px)' }}
                        >
                            <Sheet.Backdrop travelAnimation={{ opacity: [0, 0.33] }} themeColorDimming="auto" />
                            <Sheet.Content
                                className="bg-white rounded-2xl p-6 shadow-lg w-full max-w-md overflow-y-auto"
                                style={{ height: 'calc(min(700px, 70svh) + env(safe-area-inset-bottom, 0px))' }}
                            >
                                <div className="h-full w-full flex flex-col">
                                    <Sheet.Trigger action="dismiss" asChild className="fixed top-0 right-0">
                                        <SheetDismissButton className="w-10 h-10" />
                                    </Sheet.Trigger>
                                    {irrelevantSheetPhoto.url && (
                                        <div className="mb-4 flex justify-center">
                                            <Image src={irrelevantSheetPhoto.url} alt={irrelevantSheetPhoto.title || 'Irrelevant photo'} width={200} height={200} className="rounded-lg object-cover" />
                                        </div>
                                    )}
                                    <div className="mb-2">
                                        <span className="font-medium">Reason:</span> {irrelevantSheetPhoto.irrelevant_reason || 'N/A'}
                                    </div>
                                    <div className="mb-2">
                                        <span className="font-medium">Confidence:</span> {irrelevantSheetPhoto.irrelevant_confidence !== undefined ? `${(irrelevantSheetPhoto.irrelevant_confidence * 100).toFixed(1)}%` : 'N/A'}
                                    </div>
                                </div>
                            </Sheet.Content>
                        </Sheet.View>
                    </Sheet.Portal>
                </Sheet.Root>
            )}
        </div>
    );
};

// Client-only component to show browser info (avoids hydration mismatch)
function BrowserInfo() {
  const [browserInfo, setBrowserInfo] = useState('Loading...');
  
  useEffect(() => {
    // Only run in browser environment
    if (typeof window !== 'undefined') {
      setBrowserInfo(navigator.userAgent);
    }
  }, []);
  
  return <div>Browser: {browserInfo}</div>;
}

//make this component available to the app
export default Account;