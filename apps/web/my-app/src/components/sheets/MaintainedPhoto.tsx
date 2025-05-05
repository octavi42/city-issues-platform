"use client";

import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from "react";
import '../../components/examples/Page/ExamplePage.css';
import '../../components/examples/Page/Page.css';
import { Sheet } from "@silk-hq/components";
import { runQuery } from "@/lib/neo4j";
import Image from "next/image";

interface MaintainedPhotoProps {
  photoId: string;
}

interface PhotoData {
  photo_id: string;
  url?: string;
  title?: string;
  description?: string;
  location?: string;
  image_url?: string;
  [key: string]: unknown;
}

// Component for displaying a single maintained photo
const MaintainedPhoto: React.FC<MaintainedPhotoProps> = ({ photoId }) => {
  const [photoData, setPhotoData] = useState<PhotoData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPhoto = async () => {
      try {
        setIsLoading(true);
        // Try to fetch from Neo4j
        try {
          // First try matching by photoId
          const cypher = `
            MATCH (p:Photo)
            WHERE p.photo_id = $photoId
            RETURN properties(p) AS photo
          `;
          
          const result = await runQuery<{ photo: PhotoData }>(cypher, { photoId });
          
          if (result.length > 0) {
            const photo = result[0].photo;
            
            // Try to fix URL if needed
            if (!photo.url && photo.image_url && typeof photo.image_url === 'string') {
              photo.url = photo.image_url;
            }
            
            setPhotoData(photo);
          } else {
            // If photo not found, use mock data
            setPhotoData({
              photo_id: photoId,
              title: 'Maintained Element',
              description: 'This is a well-maintained element in the city that contributes to the quality of urban life.',
              url: '/images/maintained-placeholder.jpg'
            });
          }
        } catch (err) {
          console.error("Error fetching photo data:", err);
          // Fallback to mock data
          setPhotoData({
            photo_id: photoId,
            title: 'Maintained Element',
            description: 'This is a well-maintained element in the city that contributes to the quality of urban life.',
            url: '/images/maintained-placeholder.jpg'
          });
        }
      } catch (err) {
        setError("Failed to load photo data");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPhoto();
  }, [photoId]);
  
  if (isLoading) {
    return (
      <div className="p-6">
        <div className="h-80 w-full bg-gray-100 rounded-xl flex items-center justify-center mb-6 animate-pulse">
          <span className="text-gray-500">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-red-500 mb-4">{error}</div>
      </div>
    );
  }
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">{photoData?.title || 'Maintained Element'}</h1>
      
      <div className="h-80 w-full bg-gray-100 rounded-xl overflow-hidden mb-6 relative">
        {photoData?.url ? (
          <Image 
            src={photoData.url} 
            alt={photoData.title || 'Maintained Element'} 
            className="h-full w-full object-cover rounded-xl"
            fill
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <span className="text-gray-500">No Image Available</span>
          </div>
        )}
      </div>
      
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Description</h2>
        <p className="text-gray-600">
          {photoData?.description || 
            'This is a well-maintained element in the city. These elements contribute to the overall quality of life and aesthetics of the urban environment.'}
        </p>
        
        {photoData?.location && (
          <div className="mt-4">
            <h3 className="text-lg font-medium">Location</h3>
            <p className="text-gray-600">{photoData.location}</p>
          </div>
        )}

        <div className="mt-8 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-500">Photo ID: {photoId}</p>
        </div>
      </div>
    </div>
  );
};

export default function MaintainedPhotoSheetWrapper({ params }: { params: { photoId: string } }) {
  const photoId = params.photoId;
  const router = useRouter();
  const [presented, setPresented] = useState(false);
  
  // Auto-present sheet on mount
  useEffect(() => {
    const timer = setTimeout(() => setPresented(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // Handle closing: set state and navigate back
  function handlePresentedChange(isPresented: boolean) {
    setPresented(isPresented);
    if (!isPresented) {
      // Delay navigation to allow closing animation
      setTimeout(() => {
        router.back();
      }, 300); 
    }
  }

  return (
    <Sheet.Root
      license="non-commercial" 
      presented={presented}
      onPresentedChange={handlePresentedChange}
      style={{ position: 'fixed', height: '100%', width: '100%', pointerEvents: presented ? 'auto' : 'none' }}>
        <Sheet.Portal>
          <Sheet.View
            className="Page-view"
            contentPlacement="right"
            swipeOvershoot={true}
            nativeEdgeSwipePrevention={true}
            style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50 }}
          >
            <Sheet.Backdrop className="Page-backdrop" />
            <Sheet.Content className="Page-content">
              <MaintainedPhoto photoId={photoId} />
            </Sheet.Content>
          </Sheet.View>
        </Sheet.Portal>
    </Sheet.Root>
  );
} 