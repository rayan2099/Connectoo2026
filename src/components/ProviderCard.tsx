/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CheckCircle2, Star, Phone, Shield } from 'lucide-react';
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

  // Format category to Arabic text helper
  const getCategoryLabel = (slug: string) => {
    if (slug === 'creators-celebrities') return 'المبدعون والمشاهير';
    if (slug === 'legal') return 'القانون';
    if (slug === 'emotional-support') return 'الدعم النفسي والعاطفي';
    if (slug === 'medical-guidance') return 'الإرشاد الطبي والصيدلي';
    if (slug === 'career-business') return 'المهنة والأعمال';
    if (slug === 'tech-support') return 'الدعم التقني';
    if (slug === 'home-car') return 'المنزل والسيارة';
    if (slug === 'life-coaching') return 'توجيه الحياة';
    return slug;
  };

  return (
    <div 
      id={`provider-card-${provider.id}`} 
      className="bento-card p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
      onClick={() => onProfileClick(provider.username)}
    >
      <div className="flex flex-col flex-1">
        {/* Top Header Row of the Bento Widget */}
        <div className="flex justify-between items-start gap-3">
          {/* Avatar with Bento style container */}
          <div className="relative">
            <img 
              src={provider.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} 
              alt={provider.fullName}
              referrerPolicy="no-referrer"
              className="w-14 h-14 rounded-2xl object-cover border border-gray-100 shadow-sm bg-gray-50 bg-white"
            />
            {isOnline && (
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center">
                <span className="online-pulse"></span>
              </span>
            )}
            {!isOnline && (
              <span 
                className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                  isBusy ? 'bg-amber-500' : 'bg-gray-300'
                }`}
              />
            )}
          </div>

          {/* Pricing indicator right-aligned */}
          <div className="text-left font-sans">
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full inline-block">
              {settings?.pricePerMinute || 0} ر.س / د
            </span>
          </div>
        </div>

        {/* Content Section */}
        <div className="mt-4 space-y-2">
          {/* Name & Badge */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3 className="font-bold text-gray-900 text-base leading-tight">
              {provider.fullName}
            </h3>
            {provider.verified && (
              <CheckCircle2 className="w-4 h-4 text-blue-600 fill-blue-50 shrink-0" title="خبير معتمد وموثق" />
            )}
          </div>

          <p className="text-[10px] text-gray-400 font-mono" dir="ltr">
            @{provider.username}
          </p>

          {/* Rating and Reviews */}
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <div className="flex items-center text-amber-500">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span className="font-bold mr-1">{provider.avgRating}</span>
            </div>
            <span className="text-gray-200">|</span>
            <span>({provider.reviewsCount} تقرير)</span>
          </div>

          {/* Category Badge */}
          <div className="pt-1">
            <span className="inline-block text-[11px] font-bold px-2 py-0.5 rounded-lg bg-gray-50 border border-gray-100 text-gray-600">
              {getCategoryLabel(settings?.categorySlug || '')}
            </span>
          </div>

          {/* Bio excerpt */}
          <p className="text-xs text-gray-500 leading-relaxed font-normal line-clamp-2 pt-1 h-9">
            {provider.bio || 'لم يتم إضافة نبذة تعريفية قصيرة بعد.'}
          </p>

          {/* Specialties / Subsections Chips */}
          {settings?.specialtySlugs && settings.specialtySlugs.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1 h-7 overflow-hidden">
              {settings.specialtySlugs.slice(0, 2).map((slug, i) => (
                <span key={slug + i} className="text-[9px] px-2 py-0.5 rounded-md bg-slate-50 text-slate-500 font-medium border border-slate-100">
                  {slug}
                </span>
              ))}
              {settings.specialtySlugs.length > 2 && (
                <span className="text-[9px] font-bold text-slate-400 self-center">+{settings.specialtySlugs.length - 2} غيرة</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Pricing & Call Action Button */}
      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-3">
        <span className="text-[10px] text-gray-400 font-medium">مكالمة فورية بلحظتها</span>
        <button
          id={`call-button-${provider.id}`}
          onClick={(e) => {
            e.stopPropagation(); // Avoid triggering card click (onProfileClick)
            onCallClick(provider.id);
          }}
          disabled={isOffline}
          className={`px-4 py-2 rounded-xl text-xs font-bold leading-none flex items-center gap-1.5 transition-all ${
            isOnline 
              ? 'bg-blue-600 hover:bg-blue-700 active:scale-95 text-white cursor-pointer shadow-sm shadow-blue-100'
              : isBusy
              ? 'bg-amber-400 hover:bg-amber-500 text-white cursor-pointer active:scale-95'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          <Phone className={`w-3 h-3 ${isOnline ? 'animate-pulse' : ''}`} />
          {isOnline ? 'طلب مكالمة' : isBusy ? 'مشغول حالياً' : 'غير متصل'}
        </button>
      </div>
    </div>
  );
}
