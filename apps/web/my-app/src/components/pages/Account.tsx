"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MapPin, CheckCircle, AlertCircle, Bell, Camera } from "lucide-react";
import { fetchUserPhotos } from "@/lib/neo4j-queries";
import { useVisitorId } from "@/app/hooks/useVisitorId";
import Image from "next/image";

interface UserPhoto {
    photo_id: string;
    url?: string;
    title?: string;
    status: string;
    type: 'issue' | 'maintenance' | 'in_progress';
    related_node_id?: string;
}

const Account = () => {
    const router = useRouter();
    const visitorId = useVisitorId();
    const [isLocationEnabled, setIsLocationEnabled] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [userPhotos, setUserPhotos] = useState<UserPhoto[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch user photos when visitor ID is available
    useEffect(() => {
        if (!visitorId) {
            // Keep loading state true if we're still waiting for visitor ID
            return;
        }
        
        const loadUserPhotos = async () => {
            try {
                const photos = await fetchUserPhotos(visitorId);
                setUserPhotos(photos);
            } catch (error) {
                console.error("Error fetching user photos:", error);
                setUserPhotos([]);
            } finally {
                setIsLoading(false);
            }
        };

        loadUserPhotos();
    }, [visitorId]);

    const handleVerify = () => {
        setIsVerified(true);
    };

    const handleEnableLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                () => setIsLocationEnabled(true),
                () => alert("Please enable location services in your browser settings.")
            );
        } else {
            alert("Geolocation is not supported by this browser.");
        }
    };

    const handlePhotoClick = (photo: UserPhoto) => {
        console.log("Photo clicked:", photo);
        console.log("Type check:", photo.type === 'maintenance');
        console.log("ID check:", !!photo.related_node_id);
        console.log("Full condition:", photo.type === 'maintenance' && !!photo.related_node_id);
        
        if (photo.type === 'issue' && photo.related_node_id) {
            // Navigate to issue page using the event_id
            router.push(`/issue/${photo.related_node_id}`);
        } else if (photo.type === 'maintenance') {
            // For maintenance items, navigate using photo_id regardless of related_node_id
            // This ensures navigation works even if maintenance ID is not properly extracted
            console.log("Maintenance condition triggered!");
            router.push(`/image/${photo.photo_id}`);
        }
        // Do nothing for 'in_progress' type - it's not clickable
    };

    return (
        <div className="relative h-full overflow-auto px-6">
            
            {/* Profile Section */}
            <div className="flex flex-col items-center mb-8 mt-8">
                <div className="w-24 h-24 rounded-full bg-[#F7F7F7] flex items-center justify-center text-2xl font-bold text-[#333] mb-4">
                    JD
                </div>
                
                <h1 className="text-4xl font-bold leading-tight mb-2 text-center">John Doe</h1>
                <p className="text-[0.9375rem] text-[#787575] mb-4 text-center">Member since May 2023</p>
                
                {!isVerified ? (
                    <button 
                        className="w-4/6 bg-[#075CDD] text-white py-3 text-base font-semibold rounded-2xl border-none cursor-pointer flex items-center justify-center gap-2"
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
                    <span className={`inline-block rounded-[1.875rem] py-2 px-4 text-[0.9375rem] font-medium ${isLocationEnabled ? 'bg-[#E6F0FF] text-[#075CDD]' : 'bg-[#F7F7F7] text-[#787575]'} my-2`}>
                        {isLocationEnabled ? "Enabled" : "Disabled"}
                    </span>
                </div>
                
                {!isLocationEnabled && (
                    <button 
                        className="w-full bg-[#075CDD] text-white py-3 text-base font-semibold rounded-2xl border-none cursor-pointer flex items-center justify-center gap-2"
                        onClick={handleEnableLocation} 
                    >
                        <MapPin size={18} />
                        Enable Location
                    </button>
                )}
            </div>

            {/* Reported Issues Section */}
            <div className="mt-6 mb-20">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <AlertCircle size={20} />
                    Reported Issues
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
                                    photo.status === "Open" 
                                        ? "bg-[#E6F0FF] text-[#075CDD]" 
                                        : photo.status === "In Progress" 
                                            ? "bg-[#F7F7E6] text-[#728019]" 
                                            : photo.status === "Maintained"
                                                ? "bg-[#E8F5E9] text-[#3B7B3B]"
                                                : "bg-[#F7F7E6] text-[#728019]"
                                }`}>
                                    {photo.status}
                                </span>
                            </div>
                        ))}
                        
                        <button 
                            className="w-full bg-white text-[#333] py-3 text-base font-semibold rounded-2xl border border-[#E0E0E0] cursor-pointer flex items-center justify-center gap-2"
                            onClick={() => router.push('/issues')}
                        >
                            <Bell size={18} />
                            View All Issues
                        </button>
                    </div>
                ) : (
                    <div className="text-center p-8 text-[#787575] bg-[#F7F7F7] rounded-[1.875rem] mt-4">
                        <AlertCircle size={24} className="mx-auto mb-2" />
                        <p>No reported issues yet</p>
                        
                        <button 
                            className="w-full bg-[#075CDD] text-white py-3 text-base font-semibold rounded-2xl border-none cursor-pointer flex items-center justify-center gap-2 mt-4"
                            onClick={() => router.push('/report')}
                        >
                            Report an Issue
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

//make this component available to the app
export default Account;