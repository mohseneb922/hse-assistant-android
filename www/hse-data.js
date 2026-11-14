const makeItems = (prefix, names) => names.map((name, index) => ({
  id: `${prefix}-${index + 1}`,
  name,
  active: true
}));

export const DEFAULT_DEPARTMENTS = makeItems("dep", [
  "تولید",
  "انبار",
  "تعمیرات و نگهداری",
  "تأسیسات",
  "اداری",
  "حراست",
  "حمل‌ونقل",
  "آزمایشگاه",
  "خدمات"
]);

export const DEFAULT_ACTIVITIES = makeItems("activity", [
  "کار گرم",
  "کار در ارتفاع",
  "کار در فضای بسته",
  "کار برقی",
  "حفاری",
  "لیفتینگ و جابجایی بار",
  "کار با ماشین‌آلات",
  "جابجایی دستی بار",
  "رانندگی و کار با لیفتراک",
  "فعالیت عمومی"
]);

export const DEFAULT_WASTE_TYPES = makeItems("waste", [
  "پسماند عادی",
  "پسماند صنعتی",
  "پسماند ویژه یا خطرناک",
  "پسماند شیمیایی",
  "روغن و فیلتر مصرف‌شده",
  "پساب"
]);

export const DEFAULT_TRAINING_COURSES = [
  "آموزش بدو ورود و آشنایی با خطرات عمومی",
  "استفاده صحیح از تجهیزات حفاظت فردی",
  "اطفای حریق و کار با خاموش‌کننده",
  "کمک‌های اولیه",
  "تخلیه اضطراری و اعلام وضعیت اضطراری",
  "ایمنی کار با ماشین‌آلات",
  "ایمنی برق و قفل‌گذاری و برچسب‌گذاری",
  "ایمنی کار در ارتفاع",
  "ایمنی کار گرم",
  "ایمنی مواد شیمیایی و مطالعه برگه اطلاعات ایمنی",
  "حمل دستی بار و اصول ارگونومی",
  "ایمنی رانندگی و کار با لیفتراک"
].map((title, index) => ({
  id: `course-${index + 1}`,
  title,
  departmentIds: [],
  active: true,
  validityMonths: 0
}));

export const DEFAULT_INSPECTION_TEMPLATES = [
  {
    id: "inspection-general",
    name: "بازرسی عمومی محیط کار",
    frequency: "روزانه",
    departmentIds: [],
    active: true,
    items: [
      "مسیرهای تردد و خروج اضطراری باز و بدون مانع هستند",
      "نظم و نظافت محیط مناسب است و کف لغزنده یا آلوده نیست",
      "علائم هشدار و ایمنی سالم و قابل مشاهده هستند",
      "تجهیزات حفاظت فردی مناسب در دسترس است و استفاده می‌شود",
      "تجهیزات اضطراری قابل دسترس و آماده استفاده هستند"
    ]
  },
  {
    id: "inspection-machinery",
    name: "بازرسی ماشین‌آلات و تجهیزات",
    frequency: "روزانه",
    departmentIds: [],
    active: true,
    items: [
      "حفاظ‌ها و تجهیزات ایمنی دستگاه سالم و نصب هستند",
      "کلید توقف اضطراری در دسترس و قابل استفاده است",
      "کابل‌ها، اتصالات و منابع انرژی وضعیت ایمن دارند",
      "نشتی، صدای غیرعادی یا لرزش غیرعادی مشاهده نمی‌شود",
      "روش ایمن توقف، تعمیر و ایزوله‌سازی مشخص است"
    ]
  },
  {
    id: "inspection-warehouse",
    name: "بازرسی انبار و جابجایی بار",
    frequency: "روزانه",
    departmentIds: [],
    active: true,
    items: [
      "چیدمان کالا و قفسه‌ها پایدار و ایمن است",
      "ظرفیت مجاز قفسه‌ها و تجهیزات رعایت شده است",
      "مسیر عبور افراد و وسایل نقلیه جدا و مشخص است",
      "مواد ناسازگار از یکدیگر جدا نگهداری می‌شوند",
      "تجهیزات جابجایی بار سالم و دارای بازرسی معتبر هستند"
    ]
  },
  {
    id: "inspection-emergency",
    name: "بازرسی تجهیزات و مسیرهای اضطراری",
    frequency: "روزانه",
    departmentIds: [],
    active: true,
    items: [
      "کپسول‌ها و تجهیزات اطفا قابل دسترس و دارای وضعیت معتبر هستند",
      "مسیرها و درهای خروج اضطراری باز هستند",
      "علائم و روشنایی اضطراری سالم هستند",
      "جعبه کمک‌های اولیه قابل دسترس و دارای اقلام معتبر است",
      "تجهیزات دوش و چشم‌شوی اضطراری در صورت وجود آماده هستند"
    ]
  }
];

export const DEFAULT_SIGN_CATEGORIES = [
  "هشدار خطر",
  "ممنوعیت",
  "الزام",
  "وضعیت ایمن و اضطراری",
  "تجهیزات آتش‌نشانی",
  "اطلاعات و راهنما"
];

export const DEFAULT_SETTINGS = {
  version: 1,
  company: { name: "" },
  departments: DEFAULT_DEPARTMENTS,
  activities: DEFAULT_ACTIVITIES,
  wasteTypes: DEFAULT_WASTE_TYPES,
  trainingCourses: DEFAULT_TRAINING_COURSES,
  inspectionTemplates: DEFAULT_INSPECTION_TEMPLATES,
  signCategories: DEFAULT_SIGN_CATEGORIES,
  qualificationTypes: makeItems("qualification", ["صلاحیت شغلی", "آموزش تخصصی", "گواهینامه اپراتوری", "گواهی فنی", "آموزش بدو ورود", "سایر"]),
  inductionTopics: [
    "معرفی خطرات عمومی محیط کار",
    "مسیرهای تردد مجاز و مناطق ممنوعه",
    "تجهیزات حفاظت فردی موردنیاز",
    "علائم هشدار و ایمنی",
    "نحوه اعلام حادثه و شرایط اضطراری",
    "مسیر خروج و نقطه تجمع اضطراری"
  ],
  signs: [],
  forms: []
};

const ARRAY_KEYS = [
  "inc", "act", "ext", "ins", "ert", "gz", "tr", "bm", "pr", "md",
  "cr", "pl", "mc", "pw", "mn", "rk", "pe", "wm", "ct", "rq",
  "cmp", "cw", "acc", "emg", "inv", "hyg", "erg", "asn", "fac",
  "doc", "aud", "logs", "kit", "drill", "meeting"
];

const clone = value => JSON.parse(JSON.stringify(value));

function normalizeCatalog(items, fallback, key = "name") {
  if (!Array.isArray(items)) return clone(fallback);
  return items
    .filter(item => item && typeof item === "object")
    .map((item, index) => ({
      ...item,
      id: String(item.id || `legacy-${key}-${index + 1}`),
      [key]: String(item[key] || item.name || item.title || "بدون عنوان"),
      active: item.active !== false
    }));
}

export function migrateState(input) {
  const state = input && typeof input === "object" && !Array.isArray(input)
    ? clone(input)
    : {};

  for (const key of ARRAY_KEYS) {
    if (!Array.isArray(state[key])) state[key] = [];
  }

  if (!state.cfg || typeof state.cfg !== "object" || Array.isArray(state.cfg)) {
    state.cfg = clone(DEFAULT_SETTINGS);
  } else {
    state.cfg = {
      ...clone(DEFAULT_SETTINGS),
      ...state.cfg,
      company: {
        ...DEFAULT_SETTINGS.company,
        ...(state.cfg.company && typeof state.cfg.company === "object" ? state.cfg.company : {})
      }
    };
    for (const key of [
      "departments", "activities", "wasteTypes", "trainingCourses",
      "inspectionTemplates", "signCategories", "qualificationTypes", "inductionTopics", "signs", "forms"
    ]) {
      if (!Array.isArray(state.cfg[key])) state.cfg[key] = clone(DEFAULT_SETTINGS[key]);
    }
  }

  state.cfg.departments = normalizeCatalog(state.cfg.departments, DEFAULT_DEPARTMENTS);
  state.cfg.activities = normalizeCatalog(state.cfg.activities, DEFAULT_ACTIVITIES);
  state.cfg.wasteTypes = normalizeCatalog(state.cfg.wasteTypes, DEFAULT_WASTE_TYPES);
  state.cfg.trainingCourses = normalizeCatalog(state.cfg.trainingCourses, DEFAULT_TRAINING_COURSES, "title");
  state.cfg.inspectionTemplates = (Array.isArray(state.cfg.inspectionTemplates)
    ? state.cfg.inspectionTemplates
    : clone(DEFAULT_INSPECTION_TEMPLATES)
  ).filter(item => item && typeof item === "object").map((item, index) => ({
    ...item,
    id: String(item.id || `legacy-inspection-${index + 1}`),
    name: String(item.name || "چک‌لیست بدون عنوان"),
    frequency: String(item.frequency || "روزانه"),
    departmentIds: Array.isArray(item.departmentIds) ? item.departmentIds : [],
    items: Array.isArray(item.items) ? item.items.map(String) : [],
    active: item.active !== false
  }));
  state.cfg.signCategories = Array.isArray(state.cfg.signCategories)
    ? state.cfg.signCategories.map(String)
    : [...DEFAULT_SIGN_CATEGORIES];
  state.cfg.qualificationTypes = normalizeCatalog(state.cfg.qualificationTypes, DEFAULT_SETTINGS.qualificationTypes);
  state.cfg.inductionTopics = Array.isArray(state.cfg.inductionTopics) ? state.cfg.inductionTopics.map(String) : [...DEFAULT_SETTINGS.inductionTopics];
  state.cfg.signs = Array.isArray(state.cfg.signs) ? state.cfg.signs : [];
  state.cfg.forms = Array.isArray(state.cfg.forms) ? state.cfg.forms : [];

  // The former "aud" screen was a manual event log, not an audit workflow.
  // Preserve those records under logs and reserve aud for real audit records.
  if (state.aud.length) {
    const knownLogIds = new Set(state.logs.map(record => record?.id).filter(Boolean));
    state.aud.forEach((record, index) => {
      if (!record?.id || !knownLogIds.has(record.id)) {
        state.logs.push({
          ...record,
          id: String(record?.id || `legacy-log-${index + 1}`),
          legacySource: "aud"
        });
      }
    });
    state.aud = [];
  }

  // Split the former combined meeting/drill register without deleting history.
  if (state.mn.length) {
    for (const record of state.mn) {
      const isDrill = String(record?.ty || "").includes("مانور");
      const target = isDrill ? state.drill : state.meeting;
      if (!target.some(item => item.id && item.id === record.id)) {
        target.push({ ...record, legacySource: "mn" });
      }
    }
    state.mn = [];
  }

  // Keep old department names referenced by records as inactive history entries.
  const knownNames = new Set(state.cfg.departments.map(item => item.name));
  const historicalNames = new Set();
  for (const record of state.pr) {
    if (record?.un) historicalNames.add(String(record.un));
  }
  for (const record of state.rq) {
    if (record?.sc && record.sc !== "سایر") historicalNames.add(String(record.sc));
  }
  for (const name of historicalNames) {
    if (!knownNames.has(name)) {
      state.cfg.departments.push({
        id: `legacy-dep-${state.cfg.departments.length + 1}`,
        name,
        active: false,
        legacy: true
      });
      knownNames.add(name);
    }
  }

  if (!state.hr || typeof state.hr !== "object" || Array.isArray(state.hr)) state.hr = {};
  if (!state.ck || typeof state.ck !== "object" || Array.isArray(state.ck)) state.ck = {};
  if (!state.ws || typeof state.ws !== "object" || Array.isArray(state.ws)) state.ws = {};

  return state;
}

export function validateBackupState(input) {
  const data = input && input.app === "HSE-Assistant" ? input.data : input;
  if (!data || typeof data !== "object" || Array.isArray(data)) return null;
  for (const key of ARRAY_KEYS) {
    if (data[key] !== undefined && !Array.isArray(data[key])) return null;
  }
  if (data.cfg !== undefined && (!data.cfg || typeof data.cfg !== "object" || Array.isArray(data.cfg))) return null;
  if (data.ck !== undefined && (!data.ck || typeof data.ck !== "object" || Array.isArray(data.ck))) return null;
  if (data.hr !== undefined && (!data.hr || typeof data.hr !== "object" || Array.isArray(data.hr))) return null;
  return data;
}
