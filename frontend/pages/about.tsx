import Image from 'next/image'
import Link from 'next/link'

const VALUES = [
  {
    title: 'Considered Design',
    description:
      'Every piece starts as a sketch that survives a dozen revisions before it earns a place in the collection.',
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.6}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    )
  },
  {
    title: 'Honest Materials',
    description:
      'We source natural fibers and low-impact dyes, and we tell you exactly what went into what you\u2019re wearing.',
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.6}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
        />
      </svg>
    )
  },
  {
    title: 'Made to Last',
    description:
      'Reinforced seams, tested fabrics, timeless cuts. Fewer pieces, worn for years \u2014 that\u2019s the whole idea.',
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.6}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    )
  },
  {
    title: 'Fair, Always',
    description:
      'Every partner workshop is audited for fair wages and safe conditions. No exceptions, no shortcuts.',
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.6}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-1.13a4 4 0 10-4-4 4 4 0 004 4zm6-4a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
    )
  }
]

const STATS = [
  { value: '12+', label: 'Years in craft' },
  { value: '80k+', label: 'Happy customers' },
  { value: '6', label: 'Partner workshops' },
  { value: '4.8/5', label: 'Average rating' }
]

const TEAM = [
  {
    name: 'Chloe Smith',
    role: 'Founder & Creative Director',
    image:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=750&fit=crop&q=80'
  },
  {
    name: 'Marc Jr',
    role: 'Head of Production',
    image:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&h=750&fit=crop&q=80'
  },
  {
    name: 'Emily Matthews',
    role: 'Lead Textile Designer',
    image:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&h=750&fit=crop&q=80'
  },
  {
    name: 'Samuel Bret',
    role: 'Sustainability Lead',
    image:
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&h=750&fit=crop&q=80'
  }
]

export default function AboutPage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <div className="relative h-[70vh] min-h-120 w-full overflow-hidden bg-[#111111]">
        <Image
          src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1800&h=1200&fit=crop&q=80"
          alt="Fabric and design studio"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-linear-to-t from-[#111111]/80 via-[#111111]/20 to-transparent" />
        <div className="relative h-full max-w-300 mx-auto px-6 md:px-10 flex flex-col justify-end pb-16">
          <p className="text-xs text-[#a8c4ab] font-semibold tracking-[0.25em] uppercase mb-3">
            Our Story
          </p>
          <h1 className="text-4xl md:text-6xl font-semibold text-white tracking-wide max-w-2xl leading-tight">
            Clothes made with intention, worn for years
          </h1>
        </div>
      </div>

      {/* Intro / Story */}
      <div className="max-w-300 mx-auto px-6 md:px-10 py-20 grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
        <div className="order-2 lg:order-1">
          <p className="text-xs text-[#7A9E7E] font-semibold tracking-[0.25em] uppercase mb-4">
            Since 2013
          </p>
          <h2 className="text-3xl md:text-4xl font-semibold text-[#111111] tracking-wide mb-6 leading-tight">
            Started in a one-room studio.
            <br />
            Still run the same way.
          </h2>
          <div className="space-y-4 text-sm md:text-[15px] text-[#555] leading-relaxed">
            <p>
              We began as three people, two sewing machines, and a stubborn
              belief that clothes didn&apos;t need to be disposable to be
              affordable. More than a decade later, that belief hasn&apos;t
              changed &mdash; even as the studio has grown into a small team of
              designers, pattern-makers, and craftspeople across the country.
            </p>
            <p>
              Every collection is still small by design. We&apos;d rather make
              fewer pieces well than chase every trend that comes through. If it
              doesn&apos;t hold up to a hundred washes, it doesn&apos;t leave
              the studio.
            </p>
          </div>
          <Link
            href="/products"
            className="inline-block mt-8 text-sm border border-[#111111] px-7 py-3 text-[#111111] hover:bg-[#111111] hover:text-white transition-colors tracking-wide"
          >
            Shop the Collection
          </Link>
        </div>

        <div className="order-1 lg:order-2 grid grid-cols-2 gap-4">
          <div className="relative aspect-3/4 mt-8">
            <Image
              src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=700&h=900&fit=crop&q=80"
              alt="Tailor working on fabric"
              fill
              sizes="(max-width: 1024px) 50vw, 25vw"
              className="object-cover"
            />
          </div>
          <div className="relative aspect-3/4">
            <Image
              src="https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=700&h=900&fit=crop&q=80"
              alt="Folded garments on a table"
              fill
              sizes="(max-width: 1024px) 50vw, 25vw"
              className="object-cover"
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="border-y border-[#e5e5e5] bg-[#F9F9F7]">
        <div className="max-w-300 mx-auto px-6 md:px-10 py-14 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map(stat => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl md:text-4xl font-semibold text-[#111111] tracking-wide">
                {stat.value}
              </p>
              <p className="text-xs text-[#999] tracking-widest uppercase mt-2">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Values */}
      <div className="max-w-300 mx-auto px-6 md:px-10 py-20">
        <div className="text-center max-w-xl mx-auto mb-14">
          <p className="text-xs text-[#7A9E7E] font-semibold tracking-[0.25em] uppercase mb-3">
            What We Stand For
          </p>
          <h2 className="text-3xl md:text-4xl font-semibold text-[#111111] tracking-wide">
            The principles behind every piece
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {VALUES.map(value => (
            <div
              key={value.title}
              className="border border-[#e5e5e5] p-7 hover:border-[#111111] transition-colors"
            >
              <span className="w-11 h-11 rounded-full bg-[#7A9E7E]/10 text-[#7A9E7E] flex items-center justify-center mb-5">
                {value.icon}
              </span>
              <h3 className="text-sm font-semibold text-[#111111] tracking-wide mb-2">
                {value.title}
              </h3>
              <p className="text-sm text-[#666] leading-relaxed">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Full-width banner */}
      <div className="relative h-105 w-full overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1445205170230-053b83016050?w=1800&h=900&fit=crop&q=80"
          alt="Fabric rolls in the studio"
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[#111111]/40" />
        <div className="relative h-full max-w-300 mx-auto px-6 md:px-10 flex items-center">
          <div className="max-w-lg">
            <p className="text-xs text-[#a8c4ab] font-semibold tracking-[0.25em] uppercase mb-3">
              Our Promise
            </p>
            <h2 className="text-2xl md:text-3xl font-semibold text-white tracking-wide leading-snug">
              If it doesn&apos;t earn a place in your closet for years, we
              won&apos;t make it.
            </h2>
          </div>
        </div>
      </div>

      {/* Team */}
      <div className="max-w-300 mx-auto px-6 md:px-10 py-20">
        <div className="text-center max-w-xl mx-auto mb-14">
          <p className="text-xs text-[#7A9E7E] font-semibold tracking-[0.25em] uppercase mb-3">
            Meet The Team
          </p>
          <h2 className="text-3xl md:text-4xl font-semibold text-[#111111] tracking-wide">
            The people behind the studio
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {TEAM.map(member => (
            <div key={member.name} className="group">
              <div className="relative aspect-4/5 bg-[#F5F5F5] overflow-hidden mb-4">
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  sizes="(max-width: 1024px) 50vw, 25vw"
                  className="object-cover grayscale-15 transition-all duration-500 group-hover:grayscale-0 group-hover:scale-[1.03]"
                />
              </div>
              <p className="text-sm font-medium text-[#111111]">
                {member.name}
              </p>
              <p className="text-xs text-[#999] mt-0.5">{member.role}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-[#111111]">
        <div className="max-w-300 mx-auto px-6 md:px-10 py-20 text-center">
          <h2 className="text-2xl md:text-3xl font-semibold text-white tracking-wide mb-4">
            Come see what we&apos;ve been working on
          </h2>
          <p className="text-sm text-[#bbb] max-w-md mx-auto mb-8 leading-relaxed">
            New pieces, same principles. Take a look at the current collection.
          </p>
          <Link
            href="/products"
            className="inline-block bg-white text-[#111111] text-sm font-medium px-8 py-3.5 hover:bg-[#7A9E7E] hover:text-white transition-colors tracking-wide"
          >
            Explore the Collection
          </Link>
        </div>
      </div>
    </div>
  )
}
