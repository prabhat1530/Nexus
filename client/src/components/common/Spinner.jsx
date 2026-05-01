export default function Spinner({ size = 'md' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div className="flex justify-center items-center p-4">
      <div className={`${sizes[size]} border-2 border-primary-500/20 border-t-primary-500 rounded-full animate-spin`} />
    </div>
  );
}
