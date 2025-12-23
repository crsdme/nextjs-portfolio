import Image from 'next/image'
import Link from 'next/link'

export async function HeaderAuthor({ author }: { author: any }) {
  return (
    <div className="flex-1 flex flex-wrap gap-2 sm:gap-4 max-w-7xl mx-auto p-2 sm:p-4">
      <Link
        href="/"
        prefetch
        className="
          group relative flex gap-4 items-center overflow-hidden rounded-lg border border-neutral-800 bg-[#1a1a1a] p-4 opacity-90
          hover:opacity-100 transition-opacity duration-200 h-full justify-center flex-1 min-w-3xs"
      >
        <Image src="/portfolio-logo.svg" alt="logo" height={50} width={140} />
      </Link>
      <div
        className="
          group relative flex gap-4 items-center overflow-hidden rounded-lg border border-neutral-800 bg-[#1a1a1a] p-4 opacity-90
          hover:opacity-100 transition-opacity duration-200 h-full justify-center w-full lg:w-auto"
      >
        <p className="font-old-english text-5xl text-white px-8">{author.name}</p>
      </div>
      <div className="flex gap-2 w-full lg:w-auto">
        {(author.socials || []).map((soc: any) => (
          <Link
            key={soc.url}
            href={soc.url}
            className="
            group relative flex gap-4 items-center overflow-hidden rounded-lg border border-neutral-800 bg-[#1a1a1a] p-4 opacity-90
            hover:opacity-100 transition-opacity duration-200 h-full justify-center w-full lg:w-auto"
          >
            <Image src={`/${soc.label}.svg`} alt={soc.label} height={44} width={44} />
          </Link>
        ))}
      </div>
      {/* <Link
        href="https://t.me/twitchkantora"
        className="
          group relative flex gap-4 items-center overflow-hidden rounded-lg border border-neutral-800 bg-[#1a1a1a] p-4 opacity-90
          hover:opacity-100 transition-opacity duration-200 h-full justify-center"
      >
        <Image src="/telegram.svg" alt="logo" height={44} width={44} />
      </Link>
      <Link
        href="https://www.youtube.com/@TWITCHKONTORA"
        className="
          group relative flex gap-4 items-center overflow-hidden rounded-lg border border-neutral-800 bg-[#1a1a1a] p-4 opacity-90
          hover:opacity-100 transition-opacity duration-200 h-full justify-center"
      >
        <Image src="/youtube.svg" alt="logo" height={44} width={44} />
      </Link> */}
    </div>
  )
}
