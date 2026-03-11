import React from "react";

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => {
  return (
    <div className={`animate-pulse bg-white/5 rounded-md ${className}`} />
  );
};

export const CardSkeleton = () => (
  <div className="space-y-3">
    <Skeleton className="aspect-[2/3] rounded-xl" />
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-3 w-1/2" />
  </div>
);

export const SectionSkeleton = ({ title }: { title: string }) => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div className="h-8 w-48 bg-white/5 animate-pulse rounded-lg" />
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  </div>
);
