# Connectoo | كونكتو

كونكتو منصة عربية للمكالمات الصوتية الفورية بين العملاء ومقدمي الخدمة. تجمع بين مكالمات حصرية مع المبدعين والمشاهير، وسوق خبراء فوري في القانون، الدعم النفسي، الإرشاد الطبي والصيدلي، الأعمال، التقنية، المنزل والسيارة، وتوجيه الحياة.

## الحالة الحالية

هذا الإصدار يحتوي على واجهة وتجربة أولية جيدة، لكنه يحتاج ربطاً إنتاجياً قبل الإطلاق:

- Supabase Auth لتسجيل الدخول وإنشاء الحسابات.
- Supabase Postgres كمصدر البيانات الحقيقي.
- Vercel Functions أو Supabase Edge Functions للأجزاء السرية مثل Agora والمدفوعات.
- Agora token حقيقي من الخادم.
- مزود دفع حقيقي مع webhook.

راجع [docs/LAUNCH_GUIDE.md](docs/LAUNCH_GUIDE.md) قبل أي نشر إنتاجي.

## تشغيل المشروع محلياً

```bash
npm install
npm run dev
```

## إعداد Supabase

شغل الملفات التالية في Supabase SQL Editor:

```text
db/schema.sql
db/seed.sql
```

بعد تشغيل seed يجب أن تكون النتيجة:

```text
sections_count = 8
subsections_count = 90
```

## متغيرات البيئة

انسخ `.env.example` إلى `.env` محلياً، وأضف نفس القيم في Vercel عند النشر.
