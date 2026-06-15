/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CheckCircle2, Star, Phone, Zap } from 'lucide-react';
import { Profile, ProviderSettings } from '../types.js';

interface ProviderCardProps {
  key?: any;
  provider: Profile & {
    settings?: ProviderSettings;
    avgRating: number;
    reviewsCount: number;
  };
  onCallClick: (providerId: string) => any;
  onProfileClick: (username: string) => any;
}

export default function ProviderCard({ provider, onCallClick, onProfileClick }: ProviderCardProps) {
  const settings = provider.settings;
  const isOnline = settings?.availabilityStatus === 'online';
  const isBusy = settings?.availabilityStatus === 'busy';
  const isOffline = !settings?.availabilityStatus || settings.availabilityStatus === 'offline';

  const categoryLabels: Record<string, string> = {
    'creators-celebrities': 'مبدعون ومشاهير',
    legal: 'قانون فوري',
    'emotional-support': 'دعم نفسي',
    'medical-guidance': 'إرشاد طبي',
    'career-business': 'أعمال ومهنة',
    'tech-support': 'دعم تقني',
    'home-car': 'منزل وسيارة',
    'life-coaching': 'توجيه حياة',
  };

  const statusText = isOnline ? 'متاح الآن' : isBusy ? 'في مكالمة' : 'غير متاح';

  return (
    <article
      id={`provider-card-${provider.id}`}
      className="bento-card group p-5 flex flex-col justify-between cursor-pointer overflow-hidden"
      onClick={() => onProfileClick(provider.username)}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            <img
              src={provider.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
              alt={provider.fullName}
              referrerPolicy="no-referrer"
              className="w-16 h-16 rounded-2xl object-cover border border-slate-200 bg-slate-50"
            />
            <span
              className={`absolute -top-1 -right-1 h-4 w-4 rounded-full border-2 border-white ${
                isOnline ? 'bg-emerald-500' : isBusy ? 'bg-amber-500' : 'bg-slate-300'
              }`}
            />
          </div>

          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-1.5">
              <h3 className="font-extrabold text-slate-950 text-base leading-tight truncate">
                {provider.fullName}
              </h3>
              {provider.verified && (
                <CheckCircle2 className="w-4 h-4 text-blue-600 fill-blue-50 shrink-0" title="موثق" />
              )}
            </div>
            <p className="text-[11px] text-slate-400 font-mono truncate" dir="ltr">
              @{provider.username}
            </p>
          </div>
        </div>

        <span className={`text-[10px] font-black px-2.5 py-1 rounded-full shrink-0 ${
          isOnline ? 'bg-emerald-50 text-emerald-700' : isBusy ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-500'
        }`}>
          {statusText}
        </span>
      </div>

      <div className="mt-5 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <span className="quick-pill px-3 py-1 text-[11px] font-extrabold">
            {categoryLabels[settings?.categorySlug || ''] || 'خدمة مباشرة'}
          </span>
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="font-black text-slate-800">{provider.avgRating}</span>
            <span className="text-slate-300">({provider.reviewsCount})</span>
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed font-semibold line-clamp-2 min-h-10">
          {provider.bio || 'جاهز لمكالمة سريعة ومباشرة عندما تحتاج جواباً الآن.'}
        </p>

        {settings?.specialtySlugs && settings.specialtySlugs.length > 0 && (
          <div className="flex flex-wrap gap-1.5 min-h-7 overflow-hidden">
            {settings.specialtySlugs.slice(0, 3).map((slug, i) => (
              <span key={slug + i} className="text-[10px] px-2 py-1 rounded-lg bg-slate-50 text-slate-500 font-bold border border-slate-100">
                {slug}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
        <div className="space-y-0.5">
          <p className="text-[10px] text-slate-400 font-bold">السعر الآن</p>
          <p className="text-lg font-black text-slate-950">
            {settings?.pricePerMinute || 0}
            <span className="text-[10px] text-slate-500 font-bold"> ر.س/د</span>
          </p>
        </div>

        <button
          id={`call-button-${provider.id}`}
          onClick={(e) => {
            e.stopPropagation();
            onCallClick(provider.id);
          }}
          disabled={isOffline}
          className={`px-4 py-2.5 rounded-2xl text-xs font-black leading-none flex items-center gap-1.5 transition-all ${
            isOnline
              ? 'bg-teal-600 hover:bg-teal-700 active:scale-95 text-white cursor-pointer shadow-lg shadow-teal-100'
              : isBusy
              ? 'bg-amber-500 hover:bg-amber-600 text-white cursor-pointer active:scale-95'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
        >
          {isOnline ? <Zap className="w-3.5 h-3.5" /> : <Phone className="w-3.5 h-3.5" />}
          {isOnline ? 'اتصل الآن' : isBusy ? 'جرّب لاحقاً' : 'غير متاح'}
        </button>
      </div>
    </article>
  );
}
