import { HiSparkles, HiChat, HiHeart } from 'react-icons/hi';

export default function AuthShowcase() {
  return (
    <div className="auth-showcase relative hidden lg:flex flex-col justify-between overflow-hidden p-12 xl:p-16">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_42%_38%,rgba(133,153,255,0.19),transparent_45%)]" />
      <div className="relative flex items-center gap-3">
        <div className="brand-mark h-12 w-12"><HiSparkles className="h-6 w-6" /></div>
        <span className="font-display text-3xl font-bold tracking-tight">nexus<span className="text-accent-amber">.</span></span>
      </div>
      <div className="auth-stage relative mx-auto flex h-[350px] w-full max-w-[420px] items-center justify-center" aria-hidden="true">
        <div className="auth-orbit auth-orbit-one" />
        <div className="auth-orbit auth-orbit-two" />
        <div className="auth-tile auth-tile-back" />
        <div className="auth-tile auth-tile-front">
          <div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-400/25 text-primary-200"><HiSparkles className="h-6 w-6" /></span><span className="h-2.5 w-24 rounded-full bg-white/25" /></div>
          <div className="mt-7 space-y-3"><div className="h-2.5 w-full rounded-full bg-white/20" /><div className="h-2.5 w-4/5 rounded-full bg-white/15" /><div className="h-2.5 w-2/3 rounded-full bg-white/10" /></div>
          <div className="mt-8 flex gap-4 text-primary-200"><HiHeart className="h-6 w-6" /><HiChat className="h-6 w-6" /></div>
        </div>
        <div className="auth-glow" />
      </div>
      <div className="relative max-w-md">
        <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.25em] text-primary-300">Connect with intention</p>
        <h2 className="font-display text-4xl font-bold leading-tight text-white">Closer to the people and ideas that matter.</h2>
        <p className="mt-4 text-sm leading-7 text-gray-400">A thoughtful space to share moments, spark conversations, and stay connected.</p>
      </div>
    </div>
  );
}
