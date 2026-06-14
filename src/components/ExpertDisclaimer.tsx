/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldAlert } from 'lucide-react';

export default function ExpertDisclaimer() {
  return (
    <div id="expert-disclaimer-card" className="bg-orange-50 border border-orange-100 text-orange-850 rounded-2xl p-4 md:p-5 flex items-start gap-3 md:gap-4 shadow-sm" dir="rtl">
      <div className="bg-orange-100 p-2 rounded-xl text-orange-700 shrink-0">
        <ShieldAlert className="w-5 h-5 md:w-6 md:h-6" />
      </div>
      <div className="flex-1 space-y-1 text-right">
        <h4 className="font-extrabold text-xs md:text-sm text-orange-950">إشعار أمان وإخلاء مسؤولية مهم جداً</h4>
        <p className="text-[11px] md:text-xs leading-relaxed text-orange-800 font-medium">
          في الحالات الطارئة أو التي تهدد السلامة، اتصل بخدمات الطوارئ (999) أولاً. مكالمات الخبراء هنا للإرشاد السريع والاستبيان الأولي وليست بديلاً عن تدخل الطوارئ أو العلاج الطبي المتخصص أو الاستشارة القانونية الرسمية في المحاكم.
        </p>
      </div>
    </div>
  );
}
