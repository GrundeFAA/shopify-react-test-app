export function StyleBaselinePage() {
  return (
    <main className="min-h-screen bg-neutral-off-white p-6 text-neutral-charcoal">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="space-y-2">
          <h1 className="text-h4 font-semibold text-brand-primary">Styling Baseline</h1>
          <p className="text-body text-neutral-charcoal-light">
            Denne siden brukes kun for styling-test. Hvis alt ser riktig ut her, fungerer
            Tailwind + Shadow DOM-isolasjon.
          </p>
        </header>

        <section className="rounded-lg border border-neutral-medium-grey bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-h5 font-semibold text-neutral-charcoal">Typography</h2>
          <div className="space-y-2">
            <p className="text-h3 font-semibold text-neutral-charcoal">H3 eksempeltekst</p>
            <p className="text-intro text-neutral-charcoal-light">
              Intro-tekst med medium line-height for lesbarhet.
            </p>
            <p className="text-body text-neutral-charcoal">
              Body-tekst: Dette er en nøytral baseline for å verifisere spacing, fonts og farger.
            </p>
            <p className="text-small text-neutral-silver">Small/label tekst i 14px.</p>
          </div>
        </section>

        <section className="rounded-lg border border-neutral-medium-grey bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-h5 font-semibold text-neutral-charcoal">Buttons</h2>
          <div className="flex flex-wrap gap-3">
            <button type="button" className="btn btn-primary">
              Primary
            </button>
            <button type="button" className="btn btn-secondary">
              Secondary
            </button>
            <button type="button" className="btn btn-tertiary">
              Tertiary
            </button>
            <button type="button" className="btn btn-tertiary-action">
              Tertiary Action
            </button>
            <button type="button" className="btn btn-danger">
              Danger
            </button>
            <button type="button" className="btn btn-primary" disabled>
              Disabled
            </button>
            <button type="button" className="btn btn-sm btn-primary">
              Small Primary
            </button>
          </div>
        </section>

        <section className="rounded-lg border border-neutral-medium-grey bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-h5 font-semibold text-neutral-charcoal">Color swatches</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <div className="rounded-md bg-brand-primary p-3 text-small text-white">brand-primary</div>
            <div className="rounded-md bg-brand-secondary p-3 text-small text-white">brand-secondary</div>
            <div className="rounded-md bg-semantic-warning p-3 text-small text-neutral-charcoal">
              semantic-warning
            </div>
            <div className="rounded-md bg-semantic-info p-3 text-small text-neutral-charcoal">
              semantic-info
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
