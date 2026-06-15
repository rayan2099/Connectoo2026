-- Refresh Arabic marketplace naming and section descriptions.
-- Safe to run more than once.

update public.marketplace_sections
set
  label_ar = case slug
    when 'creators-celebrities' then 'لقاءات المبدعين'
    when 'legal' then 'قانون وطوارئ'
    when 'emotional-support' then 'دعم نفسي فوري'
    when 'medical-guidance' then 'صحة وأدوية'
    when 'career-business' then 'عمل وأعمال'
    when 'tech-support' then 'تقنية وحسابات'
    when 'home-car' then 'منزل وسيارة'
    when 'life-coaching' then 'حياة وعلاقات'
    else label_ar
  end,
  label_en = case slug
    when 'creators-celebrities' then 'Creator Calls'
    when 'legal' then 'Legal & Urgent Situations'
    when 'emotional-support' then 'Immediate Emotional Support'
    when 'medical-guidance' then 'Health & Medication'
    when 'career-business' then 'Work & Business'
    when 'tech-support' then 'Tech & Accounts'
    when 'home-car' then 'Home & Car'
    when 'life-coaching' then 'Life & Relationships'
    else label_en
  end,
  description_ar = case slug
    when 'creators-celebrities' then 'مكالمات صوتية خاصة مع مؤثرين، فنانين، لاعبين، ومشاهير تتابعهم. للتواصل، الأسئلة، التهاني، واللحظات الحصرية.'
    when 'legal' then 'عندما يحدث موقف مفاجئ وتحتاج أن تفهم حقوقك وخطوتك التالية بسرعة، تحدث مع محام أو خبير قانوني متاح.'
    when 'emotional-support' then 'مساحة صوتية هادئة وقت القلق، الضغط، الخلافات، أو اللحظات الثقيلة. تحدث مع مختص أو داعم مؤهل يساعدك ترتب أفكارك.'
    when 'medical-guidance' then 'أسئلة سريعة عن دواء، أعراض، تداخلات، أو هل يحتاج الموضوع زيارة طبيب. إرشاد صحي أولي لا يستبدل الطوارئ.'
    when 'career-business' then 'قرارات مهنية وتجارية تحتاج جواباً سريعاً: مقابلة، راتب، مشروع، تسويق، أو مشكلة في العمل.'
    when 'tech-support' then 'مشكلة جهاز، إنترنت، حساب مخترق، موقع، تطبيق، أو أداة ذكاء اصطناعي. تحدث مع شخص يعرف الحل العملي.'
    when 'home-car' then 'قبل ما تتحرك أو تدفع، خذ رأياً سريعاً من فني أو ميكانيكي حول عطل، فحص، صيانة، أو مشكلة مفاجئة.'
    when 'life-coaching' then 'قرارات شخصية، علاقات، عادات، تواصل، أو لحظة تحتاج فيها شخصاً يساعدك ترى الصورة أوضح.'
    else description_ar
  end
where slug in (
  'creators-celebrities',
  'legal',
  'emotional-support',
  'medical-guidance',
  'career-business',
  'tech-support',
  'home-car',
  'life-coaching'
);
