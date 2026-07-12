import React from 'react';

function Pulse({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-white/[0.06] rounded-lg ${className}`} />;
}

export function ProfileSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr_300px] gap-6">
      <div className="space-y-4">
        <div className="bg-noir-700 border border-white/[0.06] rounded-xl p-5">
          <Pulse className="w-16 h-16 rounded-full mx-auto mb-3" />
          <Pulse className="w-24 h-3 mx-auto mb-2" />
          <Pulse className="w-16 h-2.5 mx-auto" />
        </div>
        <div className="bg-noir-700 border border-white/[0.06] rounded-xl p-3 space-y-2">
          {Array.from({ length: 6 }).map((_, i) => <Pulse key={i} className="h-8" />)}
        </div>
      </div>
      <div className="space-y-6">
        <div className="bg-noir-700 border border-white/[0.06] rounded-xl p-6">
          <Pulse className="w-40 h-4 mb-5" />
          <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6">
            <Pulse className="w-28 h-28 rounded-full mx-auto md:mx-0" />
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 8 }).map((_, i) => <Pulse key={i} className="h-9" />)}
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-noir-700 border border-white/[0.06] rounded-xl p-5">
            <Pulse className="w-28 h-4 mb-4" />
            <Pulse className="w-full h-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
