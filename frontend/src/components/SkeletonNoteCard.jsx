import React from 'react';

const SkeletonNoteCard = () => {
  return (
    <div className="bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.07)] p-6 border border-gray-100">
      {/* Title Skeleton */}
      <div className="h-7 bg-gray-200 rounded-lg w-3/4 mb-4 animate-pulse" />

      {/* Content Skeleton - 3 lines */}
      <div className="space-y-3 mb-6">
        <div className="h-4 bg-gray-100 rounded-lg w-full animate-pulse" />
        <div className="h-4 bg-gray-100 rounded-lg w-11/12 animate-pulse" />
        <div className="h-4 bg-gray-100 rounded-lg w-4/5 animate-pulse" />
      </div>

      {/* Tags Skeleton */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="h-6 bg-gray-100 rounded-full w-16 animate-pulse" />
        <div className="h-6 bg-gray-100 rounded-full w-20 animate-pulse" />
        <div className="h-6 bg-gray-100 rounded-full w-14 animate-pulse" />
      </div>

      {/* Action Buttons Skeleton */}
      <div className="flex justify-end gap-2 mt-2">
        <div className="h-9 w-9 bg-gray-100 rounded-full animate-pulse" />
        <div className="h-9 w-9 bg-gray-100 rounded-full animate-pulse" />
        <div className="h-9 w-9 bg-gray-100 rounded-full animate-pulse" />
        <div className="h-9 w-9 bg-gray-100 rounded-full animate-pulse" />
      </div>
    </div>
  );
};

export default SkeletonNoteCard;
