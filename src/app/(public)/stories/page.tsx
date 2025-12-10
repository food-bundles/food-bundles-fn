"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface Post {
  id: string;
  content: string;
  images: string[];
  videos: string[];
  createdAt: string;
}

interface RestaurantStories {
  restaurantId: string;
  restaurantName: string;
  posts: Post[];
}

export default function StoriesPage() {
  const searchParams = useSearchParams();
  const restaurantId = searchParams.get("restaurant");
  
  const [stories, setStories] = useState<RestaurantStories | null>(null);
  const [currentPostIndex, setCurrentPostIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (restaurantId) {
      fetchRestaurantPosts();
    }
  }, [restaurantId]);

  const fetchRestaurantPosts = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://server.food.rw'}/posts/restaurant/${restaurantId}`
      );
      const data = await res.json();
      
      if (data.data && data.data.length > 0) {
        setStories({
          restaurantId: restaurantId!,
          restaurantName: data.data[0].restaurant.name,
          posts: data.data,
        });
      }
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (!stories) return;
    
    const currentPost = stories.posts[currentPostIndex];
    if (currentImageIndex < currentPost.images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    } else if (currentPostIndex < stories.posts.length - 1) {
      setCurrentPostIndex(currentPostIndex + 1);
      setCurrentImageIndex(0);
    }
  };

  const handlePrevious = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    } else if (currentPostIndex > 0) {
      setCurrentPostIndex(currentPostIndex - 1);
      setCurrentImageIndex(stories?.posts[currentPostIndex - 1].images.length - 1 || 0);
    }
  };

  const handleClose = () => {
    window.location.href = "/";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!stories || stories.posts.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <p>No posts found</p>
          <Button onClick={handleClose} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const currentPost = stories.posts[currentPostIndex];
  const currentImage = currentPost.images[currentImageIndex];
  const totalSlides = stories.posts.reduce((acc, post) => acc + post.images.length, 0);
  const currentSlideNumber = stories.posts
    .slice(0, currentPostIndex)
    .reduce((acc, post) => acc + post.images.length, 0) + currentImageIndex + 1;

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="relative w-full max-w-md h-[600px] bg-gray-900 rounded-lg overflow-hidden">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-50 bg-black/50 rounded-full p-2 hover:bg-black/70 transition"
        >
          <X className="w-6 h-6 text-white" />
        </button>

        <div className="absolute top-4 left-4 right-16 z-40 flex gap-1">
          {stories.posts.map((post, postIdx) =>
            post.images.map((_, imgIdx) => {
              const isActive =
                postIdx === currentPostIndex && imgIdx === currentImageIndex;
              const isPast =
                postIdx < currentPostIndex ||
                (postIdx === currentPostIndex && imgIdx < currentImageIndex);
              
              return (
                <div
                  key={`${postIdx}-${imgIdx}`}
                  className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden"
                >
                  <div
                    className={`h-full bg-white transition-all duration-300 ${
                      isPast ? "w-full" : isActive ? "w-1/2" : "w-0"
                    }`}
                  />
                </div>
              );
            })
          )}
        </div>

        <div className="absolute top-12 left-4 z-40 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">
              {stories.restaurantName.charAt(0)}
            </span>
          </div>
          <div>
            <p className="text-white font-semibold text-sm">
              {stories.restaurantName}
            </p>
            <p className="text-white/70 text-xs">
              {new Date(currentPost.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="relative w-full h-full">
          <Image
            src={currentImage}
            alt={currentPost.content}
            fill
            className="object-cover"
          />
        </div>

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 z-30">
          <p className="text-white text-sm">{currentPost.content}</p>
        </div>

        <button
          onClick={handlePrevious}
          disabled={currentPostIndex === 0 && currentImageIndex === 0}
          className="absolute left-0 top-0 w-1/3 h-full z-20 hover:bg-white/5 transition disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-8 h-8 text-white/50 mx-auto" />
        </button>
        <button
          onClick={handleNext}
          disabled={
            currentPostIndex === stories.posts.length - 1 &&
            currentImageIndex === currentPost.images.length - 1
          }
          className="absolute right-0 top-0 w-1/3 h-full z-20 hover:bg-white/5 transition disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-8 h-8 text-white/50 mx-auto" />
        </button>

        <div className="absolute bottom-20 right-4 z-40 bg-black/50 rounded-full px-3 py-1">
          <span className="text-white text-xs">
            {currentSlideNumber} / {totalSlides}
          </span>
        </div>
      </div>
    </div>
  );
}
