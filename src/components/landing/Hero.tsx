export default function Hero() {
    return (
        <section className="relative pt-32 pb-20 px-4">
            <div className="max-w-4xl mx-auto text-center">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--surface-alt)] border border-[var(--border)] rounded-full mb-8 shadow-sm">
                    <span className="w-2 h-2 bg-[var(--success)] rounded-full animate-pulse" />
                    <span className="text-sm text-[var(--text-muted)] font-medium">Play online with friends</span>
                </div>

                {/* Title */}
                <h1 className="text-5xl md:text-7xl font-bold text-[var(--text)] mb-6 tracking-tight">
                    Classic Games,
                    <br />
                    <span className="text-[var(--primary)]">Modern Experience</span>
                </h1>

                {/* Subtitle */}
                <p className="text-lg md:text-xl text-[var(--text-muted)] max-w-2xl mx-auto mb-12">
                    Play Ludo, Chess, Carrom and more with friends. No downloads, no signups.
                    Just enter your name and start playing instantly.
                </p>

                {/* Stats */}
                <div className="flex items-center justify-center gap-12">
                    <div className="text-center">
                        <div className="text-3xl font-bold text-[var(--text)]">1+</div>
                        <div className="text-sm text-[var(--text-muted)]">Games</div>
                    </div>
                    <div className="w-px h-12 bg-[var(--border)]" />
                    <div className="text-center">
                        <div className="text-3xl font-bold text-[var(--text)]">4</div>
                        <div className="text-sm text-[var(--text-muted)]">Max Players</div>
                    </div>
                    <div className="w-px h-12 bg-[var(--border)]" />
                    <div className="text-center">
                        <div className="text-3xl font-bold text-[var(--text)]">0</div>
                        <div className="text-sm text-[var(--text-muted)]">Downloads</div>
                    </div>
                </div>
            </div>

            {/* Background decoration */}
            <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[var(--primary)]/5 rounded-full blur-3xl opacity-50" />
            </div>
        </section>
    );
}
