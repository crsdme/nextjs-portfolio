import Image from 'next/image'
import Link from 'next/link'
import { AuthorsList } from '@/components/AuthorsList'
import { HeaderMain } from '@/components/HeaderMain'

export default async function Home() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex flex-wrap gap-2 p-2 sm:gap-4 sm:p-4 max-w-2xl mx-auto">
        <HeaderMain />
        <AuthorsList />
      </div>
      <Link
        href="https://tkclothes.store/"
        target="_blank"
        rel="noopener noreferrer"
        className="w-full h-full"
      >
        <Image
          src="/merch-image.png"
          alt="Merch Image"
          className="mx-auto w-[300px] md:w-[310px] lg:w-[340px]"
          width={320}
          height={340}
        />
      </Link>
    </div>
  )
}
