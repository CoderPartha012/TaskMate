import React from 'react';

function Pulse({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-white/[0.06] rounded-lg ${className}`} />;
}

export function AnalyticsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-noir-700 border border-white/[0.06] rounded-xl p-4">
            <Pulse className="w-6 h-6 mb-3" />
            <Pulse className="w-16 h-6 mb-2" />
            <Pulse className="w-20 h-3" />
          </div>
        ))}
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, j) => (
            <div key={j} className="bg-noir-700 border border-white/[0.06] rounded-xl p-5">
              <Pulse className="w-32 h-4 mb-1.5" />
              <Pulse className="w-48 h-3 mb-4" />
              <Pulse className="w-full h-48" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
