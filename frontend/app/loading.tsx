export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-cyan-400" />
        <p className="text-[0.8125rem] text-muted-foreground/70">Loading...</p>
      </div>
    </div>
  );
}
