-- Connectoo production marketplace taxonomy.
-- Run after db/schema.sql. This file intentionally avoids demo users.

insert into public.marketplace_sections
  (slug, provider_type, label_ar, label_en, description_ar, sort_order, active)
values
  ('creators-celebrities', 'creator', 'لقاءات المبدعين', 'Creator Calls', 'مكالمات صوتية خاصة مع مؤثرين، فنانين، لاعبين، ومشاهير تتابعهم. للتواصل، الأسئلة، التهاني، واللحظات الحصرية.', 1, true),
  ('legal', 'expert', 'قانون وطوارئ', 'Legal & Urgent Situations', 'عندما يحدث موقف مفاجئ وتحتاج أن تفهم حقوقك وخطوتك التالية بسرعة، تحدث مع محام أو خبير قانوني متاح.', 2, true),
  ('emotional-support', 'expert', 'دعم نفسي فوري', 'Immediate Emotional Support', 'مساحة صوتية هادئة وقت القلق، الضغط، الخلافات، أو اللحظات الثقيلة. تحدث مع مختص أو داعم مؤهل يساعدك ترتب أفكارك.', 3, true),
  ('medical-guidance', 'expert', 'صحة وأدوية', 'Health & Medication', 'أسئلة سريعة عن دواء، أعراض، تداخلات، أو هل يحتاج الموضوع زيارة طبيب. إرشاد صحي أولي لا يستبدل الطوارئ.', 4, true),
  ('career-business', 'expert', 'عمل وأعمال', 'Work & Business', 'قرارات مهنية وتجارية تحتاج جواباً سريعاً: مقابلة، راتب، مشروع، تسويق، أو مشكلة في العمل.', 5, true),
  ('tech-support', 'expert', 'تقنية وحسابات', 'Tech & Accounts', 'مشكلة جهاز، إنترنت، حساب مخترق، موقع، تطبيق، أو أداة ذكاء اصطناعي. تحدث مع شخص يعرف الحل العملي.', 6, true),
  ('home-car', 'expert', 'منزل وسيارة', 'Home & Car', 'قبل ما تتحرك أو تدفع، خذ رأياً سريعاً من فني أو ميكانيكي حول عطل، فحص، صيانة، أو مشكلة مفاجئة.', 7, true),
  ('life-coaching', 'expert', 'حياة وعلاقات', 'Life & Relationships', 'قرارات شخصية، علاقات، عادات، تواصل، أو لحظة تحتاج فيها شخصاً يساعدك ترى الصورة أوضح.', 8, true)
on conflict (slug) do update set
  provider_type = excluded.provider_type,
  label_ar = excluded.label_ar,
  label_en = excluded.label_en,
  description_ar = excluded.description_ar,
  sort_order = excluded.sort_order,
  active = excluded.active;

with section as (select id from public.marketplace_sections where slug = 'creators-celebrities')
insert into public.marketplace_subsections
  (section_id, slug, label_ar, label_en, sort_order, active)
select section.id, items.slug, items.label_ar, items.label_en, items.sort_order, true
from section
cross join (values
  ('mouather', 'مؤثر', 'Influencer', 1),
  ('mashhour', 'مشهور', 'Celebrity', 2),
  ('mousiqi', 'موسيقي', 'Musician', 3),
  ('riyadi', 'رياضي', 'Athlete', 4),
  ('laeb', 'لاعب', 'Gamer', 5),
  ('komidi', 'كوميدي', 'Comedian', 6),
  ('shakhsiya-aama', 'شخصية عامة', 'Public Figure', 7)
) as items(slug, label_ar, label_en, sort_order)
on conflict (section_id, slug) do update set
  label_ar = excluded.label_ar,
  label_en = excluded.label_en,
  sort_order = excluded.sort_order,
  active = excluded.active;

with section as (select id from public.marketplace_sections where slug = 'legal')
insert into public.marketplace_subsections
  (section_id, slug, label_ar, label_en, sort_order, active)
select section.id, items.slug, items.label_ar, items.label_en, items.sort_order, true
from section
cross join (values
  ('police', 'موقف جنائي / شرطة', 'Criminal Case / Police', 1),
  ('traffic-accident', 'حادث مروري', 'Traffic Accident', 2),
  ('personal-injury', 'إصابة شخصية', 'Personal Injury', 3),
  ('family-law', 'قانون الأسرة', 'Family Law', 4),
  ('workplace-labor', 'العمل والموظفين', 'Labor & Employment', 5),
  ('immigration', 'الهجرة', 'Immigration', 6),
  ('landlord-tenant', 'المالك والمستأجر', 'Landlord & Tenant', 7),
  ('business-contracts', 'عقود الأعمال', 'Business Contracts', 8),
  ('consumer-rights', 'حقوق المستهلك', 'Consumer Rights', 9),
  ('debt-collection', 'الديون والتحصيل', 'Debt & Collection', 10),
  ('cyber-harassment', 'التشهير / المضايقات الإلكترونية', 'Defamation / Cyber Harassment', 11),
  ('general-legal', 'استشارة قانونية عامة', 'General Legal Consultation', 12)
) as items(slug, label_ar, label_en, sort_order)
on conflict (section_id, slug) do update set
  label_ar = excluded.label_ar,
  label_en = excluded.label_en,
  sort_order = excluded.sort_order,
  active = excluded.active;

with section as (select id from public.marketplace_sections where slug = 'emotional-support')
insert into public.marketplace_subsections
  (section_id, slug, label_ar, label_en, sort_order, active)
select section.id, items.slug, items.label_ar, items.label_en, items.sort_order, true
from section
cross join (values
  ('anxiety-panic', 'القلق / نوبة هلع', 'Anxiety / Panic Attack', 1),
  ('stress-burnout', 'الضغط / الاحتراق', 'Stress / Burnout', 2),
  ('relationship-conflict', 'خلاف عاطفي', 'Relationship Conflict', 3),
  ('post-breakup', 'دعم بعد الانفصال', 'Post-Breakup Support', 4),
  ('family-conflict', 'خلاف عائلي', 'Family Conflict', 5),
  ('grief-loss', 'الحزن / الفقد', 'Grief / Loss', 6),
  ('loneliness', 'الوحدة', 'Loneliness', 7),
  ('anger', 'إدارة الغضب', 'Anger Management', 8),
  ('confidence', 'الثقة بالنفس', 'Self-Confidence', 9),
  ('emergency-emotional', 'دعم عاطفي طارئ', 'Emergency Emotional Support', 10),
  ('general-emotional', 'اطمئنان عاطفي عام', 'General Emotional Well-being', 11)
) as items(slug, label_ar, label_en, sort_order)
on conflict (section_id, slug) do update set
  label_ar = excluded.label_ar,
  label_en = excluded.label_en,
  sort_order = excluded.sort_order,
  active = excluded.active;

with section as (select id from public.marketplace_sections where slug = 'medical-guidance')
insert into public.marketplace_subsections
  (section_id, slug, label_ar, label_en, sort_order, active)
select section.id, items.slug, items.label_ar, items.label_en, items.sort_order, true
from section
cross join (values
  ('medication-questions', 'أسئلة عن الأدوية', 'Medication Questions', 1),
  ('side-effects', 'الأعراض الجانبية', 'Side Effects', 2),
  ('drug-interactions', 'تداخلات الأدوية', 'Drug Interactions', 3),
  ('child-health', 'صحة الأطفال', 'Children''s Health', 4),
  ('flu-fever', 'زكام / إنفلونزا / حرارة', 'Cold / Flu / Fever', 5),
  ('skin-problems', 'مشكلة جلدية', 'Skin Issue', 6),
  ('minor-injuries', 'إصابة بسيطة', 'Minor Injury', 7),
  ('nutrition-supplements', 'التغذية والمكملات', 'Nutrition & Supplements', 8),
  ('women-health', 'صحة المرأة', 'Women''s Health', 9),
  ('men-health', 'صحة الرجل', 'Men''s Health', 10),
  ('chronic-conditions', 'إرشاد للحالات المزمنة', 'Chronic Conditions Guidance', 11),
  ('need-doctor', 'هل أحتاج طبيب؟', 'Do I Need a Doctor?', 12)
) as items(slug, label_ar, label_en, sort_order)
on conflict (section_id, slug) do update set
  label_ar = excluded.label_ar,
  label_en = excluded.label_en,
  sort_order = excluded.sort_order,
  active = excluded.active;

with section as (select id from public.marketplace_sections where slug = 'career-business')
insert into public.marketplace_subsections
  (section_id, slug, label_ar, label_en, sort_order, active)
select section.id, items.slug, items.label_ar, items.label_en, items.sort_order, true
from section
cross join (values
  ('interview-prep', 'التحضير للمقابلات', 'Interview Prep', 1),
  ('resume-review', 'مراجعة السيرة الذاتية', 'Resume Review', 2),
  ('salary-negotiation', 'التفاوض على الراتب', 'Salary Negotiation', 3),
  ('career-pivot', 'تغيير المسار المهني', 'Career Pivot', 4),
  ('work-conflict', 'خلاف في العمل', 'Workplace Conflict', 5),
  ('hr-employee-rights', 'الموارد البشرية / حقوق الموظف', 'HR / Employee Rights', 6),
  ('startup-advice', 'نصائح للشركات الناشئة', 'Startup Advice', 7),
  ('sales-marketing', 'المبيعات والتسويق', 'Sales & Marketing', 8),
  ('finance-accounting-basics', 'أساسيات المالية والمحاسبة', 'Finance & Accounting Basics', 9),
  ('taxes-property', 'الضرائب ومسك الدفاتر', 'Taxes & Bookkeeping', 10),
  ('business-strategy', 'استراتيجية الأعمال', 'Business Strategy', 11),
  ('investor-pitch', 'العرض على المستثمرين', 'Pitching to Investors', 12)
) as items(slug, label_ar, label_en, sort_order)
on conflict (section_id, slug) do update set
  label_ar = excluded.label_ar,
  label_en = excluded.label_en,
  sort_order = excluded.sort_order,
  active = excluded.active;

with section as (select id from public.marketplace_sections where slug = 'tech-support')
insert into public.marketplace_subsections
  (section_id, slug, label_ar, label_en, sort_order, active)
select section.id, items.slug, items.label_ar, items.label_en, items.sort_order, true
from section
cross join (values
  ('device-issue', 'مشكلة هاتف / لابتوب', 'Phone / Laptop Issue', 1),
  ('internet-router', 'الإنترنت / الراوتر', 'Internet / Router', 2),
  ('software-issues', 'حل مشاكل البرامج', 'Software Troubleshooting', 3),
  ('account-recovery', 'استرجاع حساب', 'Account Recovery', 4),
  ('cybersecurity-hacked', 'الأمن السيبراني / حساب مخترق', 'Cybersecurity / Hacked Account', 5),
  ('website-issues', 'مشكلة موقع', 'Website Issue', 6),
  ('coding-help', 'مساعدة برمجية', 'Coding Help', 7),
  ('app-setup', 'إعداد تطبيق', 'App Setup', 8),
  ('cloud-hosting', 'السحابة / الاستضافة', 'Cloud & Hosting', 9),
  ('ai-tools', 'دعم أدوات الذكاء الاصطناعي', 'AI Tools Support', 10),
  ('gaming-stream', 'إعداد الألعاب / البث', 'Gaming / Streaming Config', 11),
  ('backup-recovery', 'نسخ احتياطي / استرجاع بيانات', 'Backup / Data Recovery', 12)
) as items(slug, label_ar, label_en, sort_order)
on conflict (section_id, slug) do update set
  label_ar = excluded.label_ar,
  label_en = excluded.label_en,
  sort_order = excluded.sort_order,
  active = excluded.active;

with section as (select id from public.marketplace_sections where slug = 'home-car')
insert into public.marketplace_subsections
  (section_id, slug, label_ar, label_en, sort_order, active)
select section.id, items.slug, items.label_ar, items.label_en, items.sort_order, true
from section
cross join (values
  ('plumbing', 'السباكة', 'Plumbing', 1),
  ('electrical', 'الكهرباء', 'Electrical', 2),
  ('hvac', 'التكييف / التدفئة', 'HVAC', 3),
  ('appliance-repair', 'إصلاح الأجهزة', 'Appliance Repair', 4),
  ('home-inspection', 'فحص المنزل', 'Home Inspection', 5),
  ('cleaning-pests', 'تنظيف / عفن / حشرات', 'Cleaning / Mold / Pest', 6),
  ('general-maintenance', 'صيانة عامة', 'General Maintenance', 7),
  ('car-wont-start', 'السيارة لا تعمل', 'Car Won''t Start', 8),
  ('car-accident-guidance', 'ما بعد حادث السيارة', 'Post-Car Accident Guidance', 9),
  ('check-engine', 'لمبة المحرك', 'Check Engine Light', 10),
  ('tires-battery', 'الإطارات / البطارية', 'Tires / Battery', 11),
  ('used-car-advice', 'نصيحة قبل شراء سيارة مستعملة', 'Advice before buying a used car', 12)
) as items(slug, label_ar, label_en, sort_order)
on conflict (section_id, slug) do update set
  label_ar = excluded.label_ar,
  label_en = excluded.label_en,
  sort_order = excluded.sort_order,
  active = excluded.active;

with section as (select id from public.marketplace_sections where slug = 'life-coaching')
insert into public.marketplace_subsections
  (section_id, slug, label_ar, label_en, sort_order, active)
select section.id, items.slug, items.label_ar, items.label_en, items.sort_order, true
from section
cross join (values
  ('decision-making', 'اتخاذ القرار', 'Decision Making', 1),
  ('self-confidence-coaching', 'الثقة', 'Confidence', 2),
  ('productivity', 'الإنتاجية', 'Productivity', 3),
  ('time-management', 'إدارة الوقت', 'Time Management', 4),
  ('habit-building', 'بناء العادات', 'Habit Building', 5),
  ('relationship-guidance', 'توجيه العلاقات', 'Relationship Coaching', 6),
  ('dating-advice', 'نصائح المواعدة', 'Dating Advice', 7),
  ('communication-skills', 'مهارات التواصل', 'Communication Skills', 8),
  ('conflict-resolution', 'حل الخلافات', 'Conflict Resolution', 9),
  ('goal-setting', 'تحديد الأهداف', 'Goal Setting', 10),
  ('motivation', 'التحفيز', 'Motivation', 11),
  ('personal-growth', 'النمو الشخصي', 'Personal Growth', 12)
) as items(slug, label_ar, label_en, sort_order)
on conflict (section_id, slug) do update set
  label_ar = excluded.label_ar,
  label_en = excluded.label_en,
  sort_order = excluded.sort_order,
  active = excluded.active;

select
  (select count(*) from public.marketplace_sections where active = true) as sections_count,
  (select count(*) from public.marketplace_subsections where active = true) as subsections_count;
