import React from 'react';

// Generic Skeleton Element
export const Skeleton = ({ className, ...props }) => {
    return (
        <div
            className={`animate-pulse bg-gray-700/50 rounded-md ${className}`}
            {...props}
        />
    );
};

// Specific Skeleton for Document Card (Community Feed)
export const DocCardSkeleton = () => {
    return (
        <div className="flex flex-col gap-4 p-6 bg-white/5 backdrop-blur-xl border border-white/5 rounded-xl shadow-lg">
            {/* Header: Avatar + Name + Time */}
            <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-full" /> {/* Avatar */}
                <div className="space-y-2">
                    <Skeleton className="h-4 w-32" /> {/* Name */}
                    <Skeleton className="h-3 w-20" /> {/* Time */}
                </div>
            </div>

            {/* Content: Title + Text */}
            <div className="space-y-3 mt-2">
                <Skeleton className="h-7 w-3/4" /> {/* Title */}
                <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                </div>
            </div>

            {/* Footer: Buttons */}
            <div className="flex items-center gap-6 mt-2 pt-4 border-t border-white/5">
                <Skeleton className="h-5 w-12" />
                <Skeleton className="h-5 w-12" />
                <Skeleton className="h-5 w-8 ml-auto" />
            </div>
        </div>
    );
};

// Specific Skeleton for Document Detail View
export const DocDetailSkeleton = () => {
    return (
        <div className="flex-1 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl overflow-y-auto custom-scrollbar relative">
            {/* Header */}
            <div className="mb-8 border-b border-white/10 pb-8">
                <Skeleton className="h-10 w-3/4 mb-6" /> {/* Title */}

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Skeleton className="w-12 h-12 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-24" />
                        </div>
                    </div>
                    <Skeleton className="h-4 w-40" />
                </div>
            </div>

            {/* Content Body */}
            <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-11/12" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-32 w-full rounded-xl" /> {/* Image placeholder */}
                <Skeleton className="h-4 w-full" />
            </div>
        </div>
    )
}
