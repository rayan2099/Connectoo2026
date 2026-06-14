/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';

export default function AudioVisualizer({ isMuted }: { isMuted: boolean }) {
  const [bars, setBars] = useState<number[]>(new Array(16).fill(15));

  useEffect(() => {
    if (isMuted) {
      setBars(new Array(16).fill(6));
      return;
    }

    const interval = setInterval(() => {
      setBars(prev => prev.map(() => Math.floor(Math.random() * 50) + 10));
    }, 120);

    return () => clearInterval(interval);
  }, [isMuted]);

  return (
    <div id="audio-visualizer-bars" className="flex items-end justify-center gap-1.5 h-20 w-64 mx-auto rounded-xl bg-slate-50 border border-slate-100 p-4">
      {bars.map((height, i) => (
        <span 
          key={i} 
          style={{ height: `${height}%` }}
          className={`w-1.5 rounded-full transition-all duration-100 ${
            isMuted 
              ? 'bg-slate-300' 
              : i % 3 === 0 
              ? 'bg-emerald-400' 
              : i % 3 === 1 
              ? 'bg-emerald-500' 
              : 'bg-indigo-500'
          }`}
        />
      ))}
    </div>
  );
}
