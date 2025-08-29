"use client";

import type React from "react";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Play,
  Pause,
  Send,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Mock data for restaurants and their stories
const mockRestaurants = [
  {
    id: "1",
    name: "Umucyo Restaurant",
    image: "/restaurants/farm-to-table-restaurant-chef.png",
    stories: [
      {
        id: "s1",
        type: "image" as const,
        content: "/products/fresh-organic-roma-tomatoes.png",
        caption: "Fresh organic tomatoes just arrived! 🍅",
        likes: 24,
        comments: 8,
        timestamp: "2h ago",
      },
      {
        id: "s2",
        type: "image" as const,
        content: "/products/fresh-atlantic-salmon-fillet.png",
        caption: "Premium Atlantic salmon for tonight's special",
        likes: 31,
        comments: 12,
        timestamp: "4h ago",
      },
    ],
  },
  {
    id: "2",
    name: "Italian Bistro",
    image: "/restaurants/italian-restaurant-chef.png",
    stories: [
      {
        id: "s3",
        type: "image" as const,
        content: "/products/artisan-cheese-selection-platter.png",
        caption: "Artisan cheese selection for our pasta dishes",
        likes: 18,
        comments: 5,
        timestamp: "1h ago",
      },
    ],
  },
  {
    id: "3",
    name: "Green Garden",
    image: "/restaurants/vegetarian-restaurant-chef.png",
    stories: [
      {
        id: "s4",
        type: "image" as const,
        content: "/products/organic-mixed-salad-greens.png",
        caption: "Organic mixed greens from our local farm partners",
        likes: 42,
        comments: 15,
        timestamp: "30m ago",
      },
      {
        id: "s5",
        type: "image" as const,
        content: "/products/fresh-parsley-bundle.png",
        caption: "Fresh herbs make all the difference! 🌿",
        likes: 28,
        comments: 9,
        timestamp: "2h ago",
      },
    ],
  },
];

export default function StoriesPage() {
  const [currentRestaurantIndex, setCurrentRestaurantIndex] = useState(0);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState([
    {
      id: "c1",
      user: "chef_mario",
      avatar: "/diverse-chef-preparing-food.png",
      text: "Looks amazing! 🔥",
      timestamp: "2h ago",
      likes: 3,
      isLiked: false,
    },
    {
      id: "c2",
      user: "foodie_sarah",
      avatar: "/diverse-woman-portrait.png",
      text: "Where do you source these from?",
      timestamp: "1h ago",
      likes: 1,
      isLiked: false,
    },
    {
      id: "c3",
      user: "local_farmer",
      avatar: "/diverse-farmers-harvest.png",
      text: "We supply these organic tomatoes! Fresh from our farm this morning 🚜",
      timestamp: "45m ago",
      likes: 8,
      isLiked: true,
    },
  ]);
  const [likeAnimation, setLikeAnimation] = useState(false);

  const currentRestaurant = mockRestaurants[currentRestaurantIndex];
  const currentStory = currentRestaurant?.stories[currentStoryIndex];
  const totalStories = currentRestaurant?.stories.length || 0;

  const goToNextStory = useCallback(() => {
    if (currentStoryIndex < totalStories - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1);
    } else if (currentRestaurantIndex < mockRestaurants.length - 1) {
      setCurrentRestaurantIndex(currentRestaurantIndex + 1);
      setCurrentStoryIndex(0);
    } else {
      setCurrentRestaurantIndex(0);
      setCurrentStoryIndex(0);
    }
    setProgress(0);
    setIsLiked(false);
  }, [currentRestaurantIndex, currentStoryIndex, totalStories]);

  const goToPreviousStory = useCallback(() => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1);
    } else if (currentRestaurantIndex > 0) {
      setCurrentRestaurantIndex(currentRestaurantIndex - 1);
      setCurrentStoryIndex(
        mockRestaurants[currentRestaurantIndex - 1].stories.length - 1
      );
    }
    setProgress(0);
    setIsLiked(false);
  }, [currentRestaurantIndex, currentStoryIndex]);

  useEffect(() => {
    if (!currentStory || isPaused) return;

    const duration = 5000;
    const interval = 50;
    const increment = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + increment;

        if (newProgress >= 100) {
          goToNextStory();
          return 0;
        }

        return newProgress;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [currentStory, isPaused, goToNextStory]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      switch (event.key) {
        case "ArrowRight":
        case " ":
          event.preventDefault();
          goToNextStory();
          break;
        case "ArrowLeft":
          event.preventDefault();
          goToPreviousStory();
          break;
        case "p":
        case "P":
          event.preventDefault();
          setIsPaused(!isPaused);
          break;
        case "Escape":
          window.history.back();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [goToNextStory, goToPreviousStory, isPaused]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      goToNextStory();
    } else if (isRightSwipe) {
      goToPreviousStory();
    }
  };

  const handleNext = () => {
    setIsPaused(false);
    goToNextStory();
  };

  const handlePrevious = () => {
    setIsPaused(false);
    goToPreviousStory();
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeAnimation(true);
    setIsPaused(true);
    setTimeout(() => {
      setLikeAnimation(false);
      setIsPaused(false);
    }, 1000);
  };

  const handleDoubleTap = () => {
    if (!isLiked) {
      handleLike();
    }
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      const comment = {
        id: `c${Date.now()}`,
        user: "you",
        avatar: "/abstract-geometric-shapes.png",
        text: newComment.trim(),
        timestamp: "now",
        likes: 0,
        isLiked: false,
      };
      setComments([...comments, comment]);
      setNewComment("");
      setIsPaused(true);
      setTimeout(() => setIsPaused(false), 500);
    }
  };

  const handleCommentLike = (commentId: string) => {
    setComments(
      comments.map((comment) =>
        comment.id === commentId
          ? {
              ...comment,
              isLiked: !comment.isLiked,
              likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
            }
          : comment
      )
    );
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const toggleComments = () => {
    setShowComments(!showComments);
    if (!showComments) {
      setIsPaused(true);
    } else {
      setIsPaused(false);
    }
  };

  const handleMouseDown = () => {
    setIsPaused(true);
  };

  const handleMouseUp = () => {
    setIsPaused(false);
  };

  if (!currentRestaurant || !currentStory) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white">No stories available</p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="relative w-full max-w-sm mx-auto h-[80vh] max-h-[700px] bg-black rounded-lg overflow-hidden shadow-2xl">
        <div className="absolute top-4 left-4 right-4 z-20 flex gap-1">
          {currentRestaurant.stories.map((_, index) => (
            <div
              key={index}
              className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden"
            >
              <div
                className="h-full bg-white transition-all duration-100 ease-linear"
                style={{
                  width:
                    index < currentStoryIndex
                      ? "100%"
                      : index === currentStoryIndex
                      ? `${progress}%`
                      : "0%",
                }}
              />
            </div>
          ))}
        </div>

        <div className="absolute top-8 left-4 right-4 z-20 flex items-center justify-between pt-4">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full overflow-hidden">
                <Image
                  src={currentRestaurant.image || "/placeholder.svg"}
                  alt={currentRestaurant.name}
                  width={32}
                  height={32}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="text-white font-medium text-sm">
                  {currentRestaurant.name}
                </p>
                <p className="text-white/70 text-xs">
                  {currentStory.timestamp}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
              onClick={togglePause}
            >
              {isPaused ? (
                <Play className="h-4 w-4" />
              ) : (
                <Pause className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="relative w-full h-full">
          <button
            onClick={handlePrevious}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="absolute left-0 top-0 w-1/3 h-full z-10 bg-transparent focus:outline-none"
            disabled={currentRestaurantIndex === 0 && currentStoryIndex === 0}
          />
          <button
            onClick={handleNext}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onDoubleClick={handleDoubleTap}
            className="absolute right-0 top-0 w-1/3 h-full z-10 bg-transparent focus:outline-none"
          />

          <div className="w-full h-full relative">
            <Image
              src={currentStory.content || "/placeholder.svg"}
              alt="Story content"
              fill
              className="object-cover rounded-lg"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 rounded-lg" />

            {likeAnimation && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
                <Heart className="h-20 w-20 text-red-500 fill-red-500 animate-ping" />
              </div>
            )}

            {isPaused && !likeAnimation && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
                <div className="bg-black/60 rounded-full p-4">
                  <Pause className="h-8 w-8 text-white" />
                </div>
              </div>
            )}
          </div>

          {currentStory.caption && (
            <div className="absolute bottom-24 left-4 right-4 z-20">
              <p className="text-white text-base font-medium leading-relaxed">
                {currentStory.caption}
              </p>
            </div>
          )}
        </div>

        <div className="absolute bottom-6 left-4 right-4 z-20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleLike}
                className="flex items-center gap-2 text-white group"
              >
                <Heart
                  className={`h-6 w-6 transition-all duration-300 ${
                    isLiked
                      ? "fill-red-500 text-red-500 scale-110"
                      : "group-hover:scale-110"
                  }`}
                />
                <span className="text-sm font-medium">
                  {currentStory.likes + (isLiked ? 1 : 0)}
                </span>
              </button>
              <button
                onClick={toggleComments}
                className="flex items-center gap-2 text-white group"
              >
                <MessageCircle
                  className={`h-6 w-6 transition-all duration-300 ${
                    showComments ? "fill-white" : "group-hover:scale-110"
                  }`}
                />
                <span className="text-sm font-medium">
                  {currentStory.comments + comments.length}
                </span>
              </button>
            </div>
            <Link
              href={`/visit-restaurant/${currentRestaurant.id}`}
              className="cursor-pointer text-white hover:underline hover:text-white/80"
            >
              View Restaurant
            </Link>
          </div>

          {showComments && (
            <div className="mt-4 bg-black/90 backdrop-blur-sm rounded-lg overflow-hidden max-h-60 flex flex-col">
              <div className="flex items-center justify-between p-3 border-b border-white/20">
                <h3 className="text-white font-medium text-sm">Comments</h3>
                <button
                  onClick={toggleComments}
                  className="text-white/70 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-3 max-h-32 scrollbar-hide">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
                      <Image
                        src={comment.avatar || "/placeholder.svg"}
                        alt={comment.user}
                        width={24}
                        height={24}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="bg-white/10 rounded-lg p-2">
                        <p className="text-white text-xs">
                          <span className="font-medium">{comment.user}</span>{" "}
                          <span className="font-normal">{comment.text}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <button
                          onClick={() => handleCommentLike(comment.id)}
                          className="flex items-center gap-1 text-white/60 hover:text-white text-xs"
                        >
                          <Heart
                            className={`h-2.5 w-2.5 ${
                              comment.isLiked ? "fill-red-500 text-red-500" : ""
                            }`}
                          />
                          {comment.likes > 0 && <span>{comment.likes}</span>}
                        </button>
                        <span className="text-white/60 text-xs">
                          {comment.timestamp}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <form
                onSubmit={handleSubmitComment}
                className="p-3 border-t border-white/20"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gray-400 flex-shrink-0">
                    <Image
                      src="/abstract-geometric-shapes.png"
                      alt="Your avatar"
                      width={24}
                      height={24}
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  <div className="flex-1 flex items-center gap-2">
                    <Input
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white/40 text-sm h-8"
                    />
                    <Button
                      type="submit"
                      size="sm"
                      disabled={!newComment.trim()}
                      className="bg-white/20 hover:bg-white/30 text-white border-0 disabled:opacity-50 h-8 w-8 p-0"
                    >
                      <Send className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 opacity-0 hover:opacity-100 transition-opacity">
        <div className="bg-black/60 rounded-lg px-3 py-2 text-xs text-white/70">
          Space/→: Next • ←: Previous • P: Pause • Double tap: Like • Esc: Exit
        </div>
      </div>
    </div>
  );
}
