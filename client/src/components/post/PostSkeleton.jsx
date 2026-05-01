export default function PostSkeleton() {
  return (
    <div className="glass-card p-5 space-y-4 animate-pulse-soft">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full skeleton" />
        <div className="space-y-2 flex-1">
          <div className="h-3 w-28 skeleton" />
          <div className="h-2 w-20 skeleton" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 w-full skeleton" />
        <div className="h-3 w-3/4 skeleton" />
      </div>
      <div className="h-48 w-full skeleton rounded-xl" />
      <div className="flex gap-4">
        <div className="h-8 w-16 skeleton rounded-lg" />
        <div className="h-8 w-16 skeleton rounded-lg" />
      </div>
    </div>
  );
}
