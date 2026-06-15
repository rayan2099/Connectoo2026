/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldAlert } from 'lucide-react';

export default function ExpertDisclaimer() {
  return (
    <div id="expert-disclaimer-card" className="bg-amber-50/90 border border-amber-200 text-amber-950 rounded-2xl p-4 md:p-5 flex items-start gap-3 md:gap-4 shadow-sm" dir="rtl">
      <div className="bg-amber-100 p-2 rounded-xl text-amber-700 shrink-0">
        <ShieldAlert className="w-5 h-5 md:w-6 md:h-6" />
      </div>
      <div className="flex-1 space-y-1 text-right">
        <h4 className="font-extrabold text-xs md:text-sm text-amber-950">تنبيه سريع قبل الاتصال</h4>
        <p className="text-[11px] md:text-xs leading-relaxed text-amber-800 font-semibold">
          إذا كان الموقف يهدد حياتك أو سلامتك، اتصل بالطوارئ أولاً. خبراء كونكتو يساعدونك على فهم الخطوة التالية بسرعة، لكنهم لا يستبدلون العلاج الطبي العاجل أو التمثيل القانوني الرسمي.
        </p>
      </div>
    </div>
  );
}
