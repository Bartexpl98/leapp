import { GlobeAltIcon } from '@heroicons/react/24/outline';
import { lusitana } from '@/app/components/ui/fonts';
import Link from 'next/link';

export default function AcmeLogo() {
  return (
<div className={`${lusitana.className} flex items-center gap-3 leading-none text-white-500`}>
      {/* icon stays fixed-size (won't shrink below this) */}
      <GlobeAltIcon className="flex-shrink-0 h-7 w-7 sm:h-9 sm:w-9 md:h-11 md:w-11 lg:h-14 lg:w-14 rotate-[15deg]" />

      {/* link + text: responsive sizes (guaranteed larger on desktop) */}
      <Link href="/" className="inline-block">
        <span className="font-extrabold tracking-tight leading-none
                         text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl">
          Discourse 
        </span>
      </Link>
    </div>
  );///<p className="text-[44px] text-white">Discourse</p>
}
