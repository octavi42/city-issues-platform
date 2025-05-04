"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, CheckCircle, AlertCircle, Bell } from "lucide-react";

interface Issue {
    id: number;
    title: string;
    status: string;
}

const Account = () => {
    const router = useRouter();
    const [isLocationEnabled, setIsLocationEnabled] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [reportedIssues] = useState<Issue[]>([
        { id: 1, title: "Broken streetlight", status: "Open" },
        { id: 2, title: "Pothole on Main St", status: "In Progress" },
    ]);

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

    const handleIssueClick = (issue: Issue) => {
        if (issue.status === "Open") {
            // Create a slug from the issue title
            const slug = issue.title.toLowerCase().replace(/\s+/g, '-');
            router.push(`/issue/${slug}`);
        }
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
                
                {reportedIssues.length > 0 ? (
                    <div>
                        {reportedIssues.map(issue => (
                            <div 
                                key={issue.id} 
                                className={`bg-white rounded-2xl p-4 px-6 mb-4 border border-[#E0E0E0] flex justify-between items-center ${issue.status === "Open" ? "cursor-pointer hover:shadow-md transition-shadow" : ""}`}
                                onClick={() => handleIssueClick(issue)}
                            >
                                <span className="text-base font-medium">{issue.title}</span>
                                <span className={`inline-block py-1 px-3 rounded-2xl text-sm font-medium ${
                                    issue.status === "Open" 
                                        ? "bg-[#E6F0FF] text-[#075CDD]" 
                                        : issue.status === "In Progress" 
                                            ? "bg-[#F7F7E6] text-[#728019]" 
                                            : "bg-[#E8F5E9] text-[#3B7B3B]"
                                }`}>
                                    {issue.status}
                                </span>
                            </div>
                        ))}
                        
                        <button className="w-full bg-white text-[#333] py-3 text-base font-semibold rounded-2xl border border-[#E0E0E0] cursor-pointer flex items-center justify-center gap-2">
                            <Bell size={18} />
                            View All Issues
                        </button>
                    </div>
                ) : (
                    <div className="text-center p-8 text-[#787575] bg-[#F7F7F7] rounded-[1.875rem] mt-4">
                        <AlertCircle size={24} className="mb-2" />
                        <p>No reported issues yet</p>
                        
                        <button className="w-full bg-[#075CDD] text-white py-3 text-base font-semibold rounded-2xl border-none cursor-pointer flex items-center justify-center gap-2 mt-4">
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