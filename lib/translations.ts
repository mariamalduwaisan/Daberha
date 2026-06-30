export type Lang = "ar" | "en";

export const t = {
  // ── Nav ──
  nav: {
    home:      { ar: "الرئيسية",  en: "Home"      },
    training:  { ar: "تدريب",     en: "Practice"  },
    plans:     { ar: "الخطط",     en: "Plans"     },
    materials: { ar: "المصادر",   en: "Resources" },
    history:   { ar: "السجل",     en: "History"   },
    signOut:   { ar: "تسجيل الخروج", en: "Sign Out" },
    appName:   { ar: "دبرها",     en: "Daberha"   },
    tagline:   { ar: "مساعد المقابلات", en: "Interview Assistant" },
  },

  // ── Sign-in ──
  signIn: {
    title:       { ar: "تسجيل الدخول",                    en: "Sign In"                         },
    subtitle:    { ar: "أدخل بريدك وسنرسل لك رابط الدخول فوراً", en: "Enter your email and we'll send a magic link" },
    emailLabel:  { ar: "البريد الإلكتروني",               en: "Email address"                   },
    cta:         { ar: "أرسل رابط الدخول",                en: "Send magic link"                 },
    sending:     { ar: "جاري الإرسال...",                 en: "Sending..."                      },
    noPassword:  { ar: "لا يلزمك تذكر كلمة مرور · رابط واحد للدخول", en: "No password needed · One link signs you in" },
    checkEmail:  { ar: "تحقق من بريدك",                  en: "Check your inbox"                },
    sentTo:      { ar: "أرسلنا رابط الدخول إلى",         en: "We sent a magic link to"         },
    linkExpiry:  { ar: "الرابط صالح لمدة ٣٠ دقيقة.",     en: "The link expires in 30 minutes." },
    tryAnother:  { ar: "إرسال إلى بريد آخر",             en: "Try a different email"           },
    error:       { ar: "حدث خطأ. يرجى المحاولة مجدداً.", en: "Something went wrong. Please try again." },
    heroTitle:   { ar: "استعد لمقابلتك\nبذكاء اصطناعي", en: "Ace your banking\ninterview with AI" },
    heroSub:     { ar: "منصة التحضير الأذكى للمقابلات الوظيفية في القطاع المصرفي الكويتي", en: "The smartest way to prepare for Kuwait banking interviews" },
    features: {
      f1: { ar: "مقابلات تجريبية بالذكاء الاصطناعي",    en: "AI-powered mock interviews"       },
      f2: { ar: "أسئلة مخصصة لكل بنك كويتي",           en: "Tailored questions per bank"       },
      f3: { ar: "ملاحظات فورية على إجاباتك",            en: "Instant feedback on answers"       },
      f4: { ar: "مصادر وأدلة تحضير شاملة",             en: "Comprehensive prep guides"         },
    },
  },

  // ── Home ──
  home: {
    greeting:     { ar: "مرحباً،",              en: "Welcome back,"        },
    subtitle:     { ar: "استمر في التحضير — كل جلسة تقربك من المقابلة المثالية", en: "Keep going — every session gets you closer to your dream job" },
    lastActive:   { ar: "آخر نشاط:",            en: "Last active:"         },
    startSession: { ar: "ابدأ جلسة جديدة",      en: "New session"          },
    stats: {
      sessions:  { ar: "جلسة تدريبية",  en: "Sessions"        },
      avgScore:  { ar: "متوسط الدرجة",  en: "Avg score"       },
      plans:     { ar: "خطط متاحة",     en: "Plans available" },
      resources: { ar: "مصادر تعليمية", en: "Resources"       },
    },
    sections:     { ar: "الأقسام الرئيسية",     en: "Quick access"         },
    recentTitle:  { ar: "آخر الجلسات",          en: "Recent sessions"      },
    viewAll:      { ar: "عرض الكل",             en: "View all"             },
    noScore:      { ar: "بدون درجة",            en: "No score"             },
    emptyTitle:   { ar: "لا توجد جلسات بعد",   en: "No sessions yet"      },
    emptySub:     { ar: "ابدأ أول مقابلة تجريبية وستظهر نتائجك هنا", en: "Start your first mock interview and your results will appear here" },
    startTraining:{ ar: "ابدأ التدريب",         en: "Start training"       },
    ai:           { ar: "ذكاء اصطناعي",         en: "AI"                   },
    actions: {
      training:  { label: { ar: "ابدأ التدريب", en: "Practice"  }, sub: { ar: "مقابلة تجريبية بالذكاء الاصطناعي", en: "AI mock interviews"      } },
      plans:     { label: { ar: "خططي",         en: "My Plans"  }, sub: { ar: "تابع مسارك التحضيري",             en: "Track your prep journey"  } },
      materials: { label: { ar: "المصادر",      en: "Resources" }, sub: { ar: "أدلة وفيديوهات وملفات",           en: "Guides, videos & files"   } },
      history:   { label: { ar: "السجل",        en: "History"   }, sub: { ar: "جلساتك السابقة ودرجاتك",          en: "Past sessions & scores"   } },
    },
  },

  // ── Training ──
  training: {
    title:       { ar: "التدريب",                     en: "Practice"                    },
    subtitle:    { ar: "مقابلات تجريبية بالذكاء الاصطناعي", en: "AI-powered mock interviews" },
    ai:          { ar: "ذكاء اصطناعي",                en: "AI"                          },
    welcome:     { ar: "مرحباً! أنا مساعدك الذكي",   en: "Hi! I'm your AI coach"       },
    welcomeSub:  { ar: "يمكنني مساعدتك في التحضير للمقابلات المصرفية. ابدأ بسؤال أو اختر من الأسئلة أدناه.", en: "I can help you prepare for banking interviews. Start with a question or pick one below." },
    placeholder: { ar: "اكتب رسالتك...",              en: "Type your message..."        },
    error:       { ar: "عذراً، حدث خطأ. يرجى المحاولة مجدداً.", en: "Sorry, an error occurred. Please try again." },
    starters: {
      s1: { ar: "ساعدني في التحضير لمقابلة NBK",              en: "Help me prepare for an NBK interview"        },
      s2: { ar: "اسألني أسئلة سلوكية شائعة",                  en: "Ask me common behavioural questions"         },
      s3: { ar: "ما هي أساسيات الخدمات المصرفية الإسلامية؟",  en: "What are Islamic banking basics?"            },
      s4: { ar: "كيف أجيب بأسلوب STAR؟",                      en: "How do I answer using the STAR method?"      },
    },
  },

  // ── Materials ──
  materials: {
    title:     { ar: "المصادر",                  en: "Resources"              },
    subtitle:  { ar: "أدلة وفيديوهات ومقالات للتحضير", en: "Guides, videos & articles for prep" },
    search:    { ar: "ابحث في المصادر",          en: "Search resources..."    },
    filters: {
      all:        { ar: "الكل",              en: "All"              },
      banking:    { ar: "أساسيات البنوك",    en: "Banking Basics"   },
      behavioural:{ ar: "الأسئلة السلوكية", en: "Behavioural"      },
    },
    featured:  { ar: "مميز",                    en: "Featured"               },
    latest:    { ar: "أحدث المصادر",            en: "Latest Resources"       },
    viewAll:   { ar: "عرض الكل",               en: "View all"               },
    noResults: { ar: "لا توجد نتائج",           en: "No results found"       },
    uploads:   { ar: "رفوعاتك",               en: "Your Uploads"            },
    uploadFile:{ ar: "رفع ملف",               en: "Upload file"             },
    badges: {
      guide:     { ar: "دليل مميز",   en: "Guide"       },
      recommended:{ ar: "موصى به",   en: "Recommended" },
    },
    watchNow:  { ar: "شاهد الآن",             en: "Watch now"               },
  },

  // ── Plans ──
  plans: {
    title:      { ar: "خططك التحضيرية",          en: "Your Prep Plans"        },
    subtitle:   { ar: "تابع تقدمك واستعد لمقابلتك بذكاء", en: "Track progress and prepare smarter" },
    activePlan: { ar: "الخطة النشطة",            en: "Active Plan"            },
    steps:      { ar: "الخطوات",                 en: "Steps"                  },
    chooseplan: { ar: "اختر خطة لبدء مسارك التحضيري", en: "Choose a plan to start your prep journey" },
    units:      { ar: "وحدات",                   en: "units"                  },
    skills:     { ar: "تركيز المهارات",          en: "Skill Focus"            },
    nextStep:   { ar: "بدء الخطوة التالية:",      en: "Next step:"             },
    resume:     { ar: "استئناف الخطوة",          en: "Resume step"            },
    status: {
      active:  { ar: "قيد التنفيذ", en: "In progress" },
      done:    { ar: "مكتمل",       en: "Completed"   },
      locked:  { ar: "مقفل",        en: "Locked"      },
    },
    from:  { ar: "من", en: "of" },
  },

  // ── History ──
  history: {
    title:      { ar: "السجل",                   en: "History"                },
    subtitle:   { ar: "جلساتك التدريبية السابقة", en: "Your past training sessions" },
    sessions:   { ar: "الجلسات",                 en: "Sessions"               },
    avgScore:   { ar: "متوسط الدرجة",            en: "Avg Score"              },
    bestScore:  { ar: "أفضل درجة",               en: "Best Score"             },
    pastSessions:{ ar: "الجلسات السابقة",        en: "Past Sessions"          },
    emptyTitle: { ar: "لا توجد جلسات بعد",       en: "No sessions yet"        },
    emptySub:   { ar: "ابدأ مقابلة تجريبية لترى نتائجك هنا", en: "Start a mock interview to see your results here" },
    startTraining:{ ar: "ابدأ التدريب",          en: "Start training"         },
    noScore:    { ar: "بدون درجة",               en: "No score"               },
  },
} as const;

export function tx(key: { ar: string; en: string }, lang: Lang): string {
  return key[lang];
}
