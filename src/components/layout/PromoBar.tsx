import { useLanguage } from '@/context/LanguageContext'

/** A slim, continuously scrolling announcement marquee above the header. Built as a single
 * flex track holding the messages twice back-to-back, animated exactly half its own width —
 * since both halves are identical, the loop point is invisible. Respects prefers-reduced-motion
 * via the global rule in index.css (which freezes all CSS animations to a single frame). */
export function PromoBar() {
  const { t } = useLanguage()
  const messages = [t('marqueeMsg1'), t('marqueeMsg2'), t('marqueeMsg3'), t('marqueeMsg4'), t('marqueeMsg5')]

  return (
    <div className="overflow-hidden bg-primary py-2 text-ivory">
      <div className="flex w-max animate-[marquee-scroll_36s_linear_infinite]" dir="ltr">
        {[...messages, ...messages].map((msg, i) => (
          <span key={i} dir="rtl" className="shrink-0 whitespace-nowrap px-8 text-xs font-medium tracking-wide sm:text-[0.8125rem]">
            {msg}
          </span>
        ))}
      </div>
    </div>
  )
}
