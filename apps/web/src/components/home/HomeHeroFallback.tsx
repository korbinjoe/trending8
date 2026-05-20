export function HomeHeroFallback() {
  return (
    <section className="hero hero--loading" aria-busy="true" aria-hidden="true">
      <div className="hero__sk-title skeleton" />
      <div className="hero__sk-meta skeleton" />
      <div className="hero__sk-meta skeleton" />
    </section>
  );
}
