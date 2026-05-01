export default function Avatar({ src, name, size = 'md', isOnline, className = '' }) {
  const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-lg', xl: 'w-20 h-20 text-2xl' };
  const dotSizes = { sm: 'w-2.5 h-2.5', md: 'w-3 h-3', lg: 'w-3.5 h-3.5', xl: 'w-4 h-4' };
  const initials = name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '?';

  return (
    <div className={`relative inline-flex shrink-0 ${className}`}>
      {src && (src.startsWith('http') || src.startsWith('https') || src.startsWith('data:')) ? (
        <img src={src} alt={name} className={`${sizes[size]} rounded-full object-cover ring-2 ring-white/10`} />
      ) : (
        <div className={`${sizes[size]} rounded-full bg-gradient-to-br from-primary-500 to-accent-blue flex items-center justify-center font-semibold text-white ring-2 ring-white/10`}>
          {initials}
        </div>
      )}
      {isOnline && (
        <span className={`absolute bottom-0 right-0 ${dotSizes[size]} bg-emerald-400 rounded-full border-2 border-dark-300 shadow-lg shadow-emerald-400/50`} />
      )}
    </div>
  );
}
