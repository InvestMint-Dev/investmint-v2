interface Props {
  size?: 'sm' | 'md' | 'lg'
  light?: boolean
}

export default function Logo({ size = 'md', light = false }: Props) {
  const sizes = { sm: 'text-lg', md: 'text-2xl', lg: 'text-3xl' }
  const iconSizes = { sm: 'w-6 h-6', md: 'w-8 h-8', lg: 'w-10 h-10' }
  const svgSize = size === 'sm' ? 14 : size === 'lg' ? 22 : 18
  const textColor = light ? 'text-white' : 'text-gray-900'

  return (
    <div className="flex items-center gap-2.5">
      <div className={`${iconSizes[size]} rounded-xl bg-green-500 flex items-center justify-center shadow-green`}>
        <svg viewBox="0 0 24 24" fill="none" className="text-white" style={{ width: svgSize, height: svgSize }}>
          <path d="M3 17l4-8 4 4 4-6 4 4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M3 21h18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      </div>
      <span className={`${sizes[size]} font-bold ${textColor} tracking-tight`}>
        Invest<span className="text-green-500">Mint</span>
      </span>
    </div>
  )
}
