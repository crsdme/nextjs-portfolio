import Image from 'next/image'
import Link from 'next/link'

export async function HeaderMain() {
  return (
    <>
      <div className="flex-1 flex gap-2 sm:gap-4 min-w-76 md:min-w-92">
        <Link
          href="https://t.me/twitchkantora"
          prefetch
          className="
          group relative flex gap-4 items-center overflow-hidden rounded-lg border border-neutral-800 bg-[#1a1a1a] p-4 opacity-90
          hover:opacity-100 transition-opacity duration-200 h-full justify-center"
        >
          <Image src="/telegram.svg" alt="logo" height={44} width={44} className="w-[36px] lg:w-[44px]" />
        </Link>
        <Link
          href="/"
          prefetch
          className="
          group relative flex gap-4 items-center overflow-hidden rounded-lg border border-neutral-800 bg-[#1a1a1a] p-4 opacity-90
          hover:opacity-100 transition-opacity duration-200 h-full justify-center flex-1"
        >
          <Image src="/portfolio-logo.svg" alt="logo" height={50} width={140} className="w-[120px] lg:w-[140px]" />
        </Link>
        <Link
          href="https://www.youtube.com/@TWITCHKONTORA"
          prefetch
          className="
          group relative flex gap-4 items-center overflow-hidden rounded-lg border border-neutral-800 bg-[#1a1a1a] p-4 opacity-90
          hover:opacity-100 transition-opacity duration-200 h-full justify-center"
        >
          <Image src="/youtube.svg" alt="logo" height={44} width={44} className="w-[36px] lg:w-[44px]" />
        </Link>
      </div>
    </>
  )
}
