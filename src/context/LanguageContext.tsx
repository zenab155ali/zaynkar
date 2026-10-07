import { createContext, useCallback, useContext, useEffect, useMemo, type ReactNode } from 'react'
import { STORAGE_KEYS } from '@/config'
import { useLocalStorage } from '@/hooks/useLocalStorage'

export type Lang = 'ar' | 'he'

/**
 * All customer-facing UI text, in both languages. Both Arabic and Hebrew read right-to-left,
 * so switching language never flips the page layout — only the words change. Product data
 * (names, descriptions, color names) is translated separately (see translate.ts) and stored
 * per-product in the database; this dictionary is only for the site's own fixed text.
 */
const STRINGS: Record<string, { ar: string; he: string }> = {
  // Header / nav
  home: { ar: 'الرئيسية', he: 'דף הבית' },
  backToHome: { ar: 'الرجوع للصفحة الرئيسية', he: 'חזרה לדף הבית' },
  backToHomeShort: { ar: 'الرئيسية', he: 'דף הבית' },
  backToShop: { ar: 'الرجوع لصفحة التسوق', he: 'חזרה לדף הקניות' },
  backToShopShort: { ar: 'رجوع للتسوق', he: 'חזרה לקניות' },
  shop: { ar: 'تسوقي', he: 'קניות' },
  openMenu: { ar: 'فتح القائمة', he: 'פתיחת התפריט' },
  closeMenu: { ar: 'إغلاق القائمة', he: 'סגירת התפריט' },
  menu: { ar: 'القائمة', he: 'תפריט' },
  myCart: { ar: 'سلة التسوق', he: 'סל הקניות שלי' },
  signIn: { ar: 'تسجيل الدخول', he: 'התחברות' },
  signInOrNewAccount: { ar: 'تسجيل الدخول / حساب جديد', he: 'התחברות / חשבון חדש' },
  liked: { ar: 'المفضلة', he: 'מועדפים' },
  signOut: { ar: 'تسجيل الخروج', he: 'התנתקות' },
  shopDresses: { ar: 'تسوقي الفساتين', he: 'קניית שמלות' },
  languageSwitch: { ar: 'עברית', he: 'العربية' },
  promoBarText: { ar: 'اختاري ما يعجبكِ وسنتواصل معكِ لإتمام طلبكِ', he: 'בחרי את מה שאת אוהבת ואנחנו ניצור איתך קשר להשלמת ההזמנה' },
  decreaseQuantity: { ar: 'إنقاص الكمية', he: 'הקטנת הכמות' },
  increaseQuantity: { ar: 'زيادة الكمية', he: 'הגדלת הכמות' },

  // Home page
  categoriesHeading: { ar: 'تسوّقي حسب الفئة', he: 'קנייה לפי קטגוריה' },
  tagline: { ar: 'أناقة تُختار بعناية، لأجلكِ فقط ✨', he: 'אלגנטיות שנבחרת בקפידה, רק בשבילך ✨' },
  heroEyebrow: { ar: 'عالم التسوق', he: 'עולם הקניות' },
  heroButton: { ar: 'اضغطي هنا للتسوق', he: 'לחצי כאן לקניות' },

  // Store listing
  dressesTitle: { ar: 'الفساتين', he: 'שמלות' },
  chooseYourLook: { ar: 'اختاري إطلالتك ✨', he: 'בחרי את המראה שלך ✨' },
  showAllCategories: { ar: 'عرض كل الفئات', he: 'הצגת כל הקטגוריות' },
  searchByCode: { ar: 'ابحثي برمز المنتج', he: 'חיפוש לפי קוד המוצר' },
  search: { ar: 'بحث', he: 'חיפוש' },
  noProductWithCode: { ar: 'لا يوجد منتج بالرمز', he: 'אין מוצר עם הקוד' },
  filters: { ar: 'الفلاتر', he: 'מסננים' },
  closeFilters: { ar: 'إغلاق الفلاتر', he: 'סגירת המסננים' },
  clearAll: { ar: 'مسح الكل', he: 'ניקוי הכל' },
  clearFilters: { ar: 'مسح الفلاتر', he: 'ניקוי המסננים' },
  showResults: { ar: 'عرض', he: 'הצגת' },
  results: { ar: 'نتيجة', he: 'תוצאות' },
  pieces: { ar: 'قطعة', he: 'פריטים' },
  size: { ar: 'المقاس', he: 'מידה' },
  color: { ar: 'اللون', he: 'צבע' },
  price: { ar: 'السعر', he: 'מחיר' },
  priceMin: { ar: 'الأدنى', he: 'מינימום' },
  priceMax: { ar: 'الأعلى', he: 'מקסימום' },
  sortRecent: { ar: 'الأحدث', he: 'החדש ביותר' },
  sortPicked: { ar: 'الأكثر اختيارًا', he: 'הנבחר ביותר' },
  sortPriceAsc: { ar: 'السعر: من الأقل للأعلى', he: 'מחיר: מהנמוך לגבוה' },
  sortPriceDesc: { ar: 'السعر: من الأعلى للأقل', he: 'מחיר: מהגבוה לנמוך' },
  loading: { ar: 'جارٍ التحميل…', he: 'טוען…' },
  noProductsYet: { ar: 'لا توجد منتجات بعد', he: 'אין עדיין מוצרים' },
  newDressesSoon: { ar: 'تُضاف فساتين جديدة بانتظام — تابعينا قريبًا.', he: 'שמלות חדשות נוספות באופן קבוע — עקבי אחרינו בקרוב.' },
  noResults: { ar: 'لا توجد نتائج', he: 'אין תוצאות' },
  tryRemovingFilter: { ar: 'جربي إزالة أحد الفلاتر.', he: 'נסי להסיר אחד מהמסננים.' },

  // Product detail page
  productInfo: { ar: 'معلومات المنتج', he: 'פרטי המוצר' },
  chooseSize: { ar: 'اختاري مقاسًا', he: 'בחרי מידה' },
  addToCart: { ar: 'أضيفي إلى سلة التسوق', he: 'הוספה לסל הקניות' },
  updateCart: { ar: 'تحديث سلة التسوق', he: 'עדכון סל הקניות' },
  viewCart: { ar: 'عرض سلة التسوق', he: 'צפייה בסל הקניות' },
  addedToCart: { ar: 'أُضيف إلى سلة التسوق', he: 'נוסף לסל הקניות' },
  cartUpdated: { ar: 'تم تحديث سلة التسوق', he: 'סל הקניות עודכן' },
  noPhotoYet: { ar: 'لا توجد صورة بعد', he: 'אין עדיין תמונה' },
  previous: { ar: 'السابق', he: 'הקודם' },
  next: { ar: 'التالي', he: 'הבא' },
  viewImageN: { ar: 'عرض الصورة', he: 'הצגת תמונה' },
  noColorSelected: { ar: 'غير محدد', he: 'לא נבחר' },
  unspecifiedSize: { ar: 'بدون مقاس', he: 'ללא מידה' },

  // Colors preview popup / grid card
  viewAllColors: { ar: 'عرض كل الألوان', he: 'הצגת כל הצבעים' },
  availableColors: { ar: 'الألوان المتوفرة', he: 'הצבעים הזמינים' },
  close: { ar: 'إغلاق', he: 'סגירה' },
  addItemToCart: { ar: 'أضيفي', he: 'הוסיפי' },
  toCart: { ar: 'إلى السلة', he: 'לסל' },
  previousImage: { ar: 'الصورة السابقة', he: 'התמונה הקודמת' },
  nextImage: { ar: 'الصورة التالية', he: 'התמונה הבאה' },

  // Likes
  removeFromFavorites: { ar: 'إزالة من المفضلة', he: 'הסרה מהמועדפים' },
  addToFavorites: { ar: 'أضيفي إلى المفضلة', he: 'הוספה למועדפים' },
  noFavoritesYet: { ar: 'لا توجد عناصر مفضّلة بعد', he: 'אין עדיין פריטים מועדפים' },
  favoritesHint: { ar: 'اضغطي على أيقونة القلب في أي فستان لحفظه هنا، لتجديه لاحقًا بسهولة.', he: 'לחצי על סמל הלב בכל שמלה כדי לשמור אותה כאן, ותמצאי אותה בקלות אחר כך.' },
  browseDresses: { ar: 'تصفحي الفساتين', he: 'עיון בשמלות' },

  // Cart (selections)
  shoppingCart: { ar: 'سلة التسوق', he: 'סל הקניות' },
  cartEmpty: { ar: 'سلة التسوق فارغة', he: 'סל הקניות ריק' },
  cartEmptyHint: { ar: 'اختاري بعض المنتجات وعودي إلى هنا لإرسال قائمتكِ.', he: 'בחרי כמה מוצרים וחזרי לכאן כדי לשלוח את הרשימה שלך.' },
  remove: { ar: 'إزالة', he: 'הסרה' },
  total: { ar: 'الإجمالي', he: 'סה"כ' },
  anythingToTellUs: { ar: 'هل هناك ما تودين إخبارنا به؟ (اختياري)', he: 'יש משהו שתרצי לספר לנו? (אופציונלי)' },
  signInToSendList: { ar: 'لإرسال قائمتكِ، سجّلي الدخول أو تابعي كزائرة بتعبئة بياناتكِ.', he: 'כדי לשלוח את הרשימה שלך, התחברי או המשיכי כאורחת על ידי מילוי הפרטים שלך.' },
  continueAsGuest: { ar: 'المتابعة كزائرة', he: 'המשך כאורחת' },
  guestDetailsRequired: { ar: 'بياناتكِ (إلزامية كي نستطيع التواصل معكِ ونأكّد الطلب)', he: 'הפרטים שלך (חובה כדי שנוכל ליצור איתך קשר ולאשר את ההזמנה)' },
  fullName: { ar: 'الاسم الكامل', he: 'שם מלא' },
  country: { ar: 'البلد', he: 'מדינה' },
  phoneNumber: { ar: 'رقم الهاتف', he: 'מספר טלפון' },
  instagramOptional: { ar: 'حساب الإنستغرام (اختياري)', he: 'חשבון אינסטגרם (אופציונלי)' },
  signInInstead: { ar: 'تسجيل الدخول بدلًا من ذلك', he: 'התחברות במקום זאת' },
  guestFieldsRequiredError: { ar: 'الاسم الكامل والبلد ورقم الهاتف إلزامية كي نستطيع التواصل معكِ.', he: 'שם מלא, מדינה ומספר טלפון הם שדות חובה כדי שנוכל ליצור איתך קשר.' },
  submitFailed: { ar: 'تعذّر إرسال قائمتك — حاولي مرة أخرى.', he: 'לא ניתן היה לשלוח את הרשימה שלך — נסי שוב.' },
  sending: { ar: 'جارٍ الإرسال…', he: 'שולח…' },
  sendMyList: { ar: 'إرسال قائمتي', he: 'שליחת הרשימה שלי' },
  noPaymentNote: { ar: 'هذا يرسل قائمتكِ إلى المتجر — لا يتم أخذ أي دفعة هنا.', he: 'פעולה זו שולחת את הרשימה שלך לחנות — לא נגבה כאן כל תשלום.' },
  orderReceivedTitle: { ar: 'تم استلام طلبكِ', he: 'ההזמנה שלך התקבלה' },
  orderReceivedGuestDesc: {
    ar: 'سنتواصل معكِ قريبًا على الرقم اللي تركتيه لتأكيد التفاصيل. بما إنه ما في حساب مسجّل، ما رح تقدري تشوفي حالة الطلب من هون — تابعي معنا مباشرة.',
    he: 'ניצור איתך קשר בקרוב במספר שהשארת כדי לאשר את הפרטים. מכיוון שאין חשבון רשום, לא תוכלי לראות את מצב ההזמנה כאן — עקבי איתנו ישירות.',
  },
  continueShopping: { ar: 'متابعة التسوق', he: 'המשך בקניות' },

  // My cart / orders page
  myRequestsTitle: { ar: 'سلة التسوق', he: 'סל הקניות שלי' },
  noOrdersYet: { ar: 'لا توجد طلبات بعد', he: 'אין עדיין הזמנות' },
  ordersWillShowHere: { ar: 'القوائم التي ترسلينها ستظهر هنا.', he: 'הרשימות שתשלחי יופיעו כאן.' },
  orderStatus: { ar: 'حالة الطلبية', he: 'סטטוס ההזמנה' },
  currentStage: { ar: '(المرحلة الحالية)', he: '(השלב הנוכחי)' },
  messagesFromStore: { ar: 'رسائل من المتجر', he: 'הודעות מהחנות' },
  code: { ar: 'الرمز', he: 'קוד' },
  quantity: { ar: 'الكمية', he: 'כמות' },

  // Auth
  welcomeBack: { ar: 'مرحبًا بعودتكِ.', he: 'ברוכה השבה.' },
  email: { ar: 'البريد الإلكتروني', he: 'דוא"ל' },
  password: { ar: 'كلمة المرور', he: 'סיסמה' },
  signingIn: { ar: 'جارٍ تسجيل الدخول…', he: 'מתחברת…' },
  newAccountQuestion: { ar: 'حساب جديد؟', he: 'חשבון חדש?' },
  createAccount: { ar: 'إنشاء حساب', he: 'יצירת חשבון' },
  signUpHint: { ar: 'سجّلي لاختيار ما يعجبكِ وإرسال قائمتكِ إلينا.', he: 'הירשמי כדי לבחור את מה שאת אוהבת ולשלוח לנו את הרשימה שלך.' },
  confirmEmailHint1: { ar: 'تحققي من بريدكِ الإلكتروني لتأكيد حسابكِ، ثم عودي و', he: 'בדקי את הדוא"ל שלך כדי לאשר את החשבון, ואז חזרי ו' },
  signInHere: { ar: 'سجّلي الدخول', he: 'התחברי כאן' },
  passwordHint: { ar: '٦ أحرف على الأقل.', he: 'לפחות 6 תווים.' },
  creatingAccount: { ar: 'جارٍ إنشاء الحساب…', he: 'יוצרת חשבון…' },
  alreadyHaveAccount: { ar: 'لديكِ حساب بالفعل؟', he: 'כבר יש לך חשבון?' },

  // 404
  error404: { ar: 'خطأ 404', he: 'שגיאה 404' },
  pageNotFound: { ar: 'لم نتمكن من العثور على هذه الصفحة', he: 'לא הצלחנו למצוא את הדף הזה' },
  pageNotFoundDesc: { ar: 'قد يكون الرابط غير صحيح، أو أن الصفحة لم تعد موجودة.', he: 'ייתכן שהקישור שגוי, או שהדף כבר לא קיים.' },
  backHome: { ar: 'العودة للرئيسية', he: 'חזרה לדף הבית' },

  // Footer
  followUs: { ar: 'تابعينا', he: 'עקבו אחרינו' },
  contactUs: { ar: 'تواصلي معنا', he: 'צרי קשר' },
  opensNewWindow: { ar: '(يفتح في نافذة جديدة)', he: '(נפתח בחלון חדש)' },
  newsletterHint: { ar: 'اشتركي ليصلكِ كل جديد.', he: 'הצטרפי כדי לקבל כל חדש.' },
  yourEmail: { ar: 'بريدكِ الإلكتروني', he: 'כתובת הדוא"ל שלך' },
  subscribe: { ar: 'اشتراك', he: 'הרשמה' },
  thanksForSubscribing: { ar: 'شكرًا لاشتراكك', he: 'תודה שנרשמת' },
  privacyPolicy: { ar: 'سياسة الخصوصية', he: 'מדיניות פרטיות' },
  termsConditions: { ar: 'الشروط والأحكام', he: 'תנאים והגבלות' },
  footerTagline: { ar: 'فساتين أنيقة، مختارة لكِ.', he: 'שמלות אלגנטיות, נבחרות במיוחד עבורך.' },
}

type StringKey = keyof typeof STRINGS

interface LanguageContextValue {
  lang: Lang
  setLang: (lang: Lang) => void
  /** Static UI text. */
  t: (key: StringKey) => string
  /** Product/category display text with an automatic fallback to Arabic if no Hebrew translation exists yet. */
  pick: (ar: string, he: string | null | undefined) => string
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useLocalStorage<Lang>(STORAGE_KEYS.lang, 'ar')

  useEffect(() => {
    document.documentElement.lang = lang
    // Both Arabic and Hebrew read right-to-left, so the layout direction never changes.
    document.documentElement.dir = 'rtl'
  }, [lang])

  const t = useCallback((key: StringKey) => STRINGS[key]?.[lang] ?? String(key), [lang])
  const pick = useCallback((ar: string, he: string | null | undefined) => (lang === 'he' && he ? he : ar), [lang])

  const value = useMemo<LanguageContextValue>(() => ({ lang, setLang, t, pick }), [lang, setLang, t, pick])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
