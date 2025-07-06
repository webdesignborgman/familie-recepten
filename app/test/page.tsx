export default function Page() {
  return (
    <div className="max-w-2xl mx-auto py-10 px-4 space-y-10">
      <h1 className="text-3xl font-bold mb-2 text-foreground">
        🎨 Familie Recepten – Kleuren & Gradients Test
      </h1>
      <p className="text-muted">
        Hieronder vind je alle custom utility classes uit je <code>globals.css</code> visueel als
        blokken.
      </p>

      {/* Primaire kleuren */}
      <section>
        <h2 className="font-semibold text-lg mb-2">Primair</h2>
        <div className="space-y-3">
          <div className="bg-primary text-background rounded-2xl p-4 shadow-card">bg-primary</div>
          <div className="bg-primary-light text-background rounded-2xl p-4 shadow-card">
            bg-primary-light
          </div>
          <div className="bg-primary-dark text-background rounded-2xl p-4 shadow-card">
            bg-primary-dark
          </div>
        </div>
      </section>

      {/* Secundair, tertiair, status */}
      <section>
        <h2 className="font-semibold text-lg mb-2">Secundair, Tertiair & Status</h2>
        <div className="space-y-3">
          <div className="bg-secondary text-foreground rounded-2xl p-4 shadow-card">
            bg-secondary
          </div>
          <div className="bg-secondary-vibrant text-background rounded-2xl p-4 shadow-card">
            bg-secondary-vibrant
          </div>
          <div className="bg-tertiary text-background rounded-2xl p-4 shadow-card">bg-tertiary</div>
          <div className="bg-tertiary-light text-foreground rounded-2xl p-4 shadow-card">
            bg-tertiary-light
          </div>
          <div className="bg-muted text-foreground rounded-2xl p-4 shadow-card">bg-muted</div>
          <div className="bg-success text-background rounded-2xl p-4 shadow-card">bg-success</div>
          <div className="bg-warning text-background rounded-2xl p-4 shadow-card">bg-warning</div>
          <div className="bg-destructive text-background rounded-2xl p-4 shadow-card">
            bg-destructive
          </div>
        </div>
      </section>

      {/* Gradients */}
      <section>
        <h2 className="font-semibold text-lg mb-2">Gradients</h2>
        <div className="space-y-3">
          <div className="bg-gradient-primary text-background rounded-2xl p-4 shadow-card">
            bg-gradient-primary
          </div>
          <div className="bg-gradient-hero text-background rounded-2xl p-4 shadow-card">
            bg-gradient-hero
          </div>
          <div className="bg-gradient-card text-foreground rounded-2xl p-4 shadow-card">
            bg-gradient-card
          </div>
          <div className="bg-gradient-subtle text-foreground rounded-2xl p-4 shadow-card">
            bg-gradient-subtle
          </div>
        </div>
      </section>

      {/* Tekstkleur voorbeeld */}
      <section>
        <h2 className="font-semibold text-lg mb-2">Tekstkleur utilities</h2>
        <div className="bg-muted rounded-2xl p-4 shadow-card">
          <span className="text-background bg-primary px-2 py-1 rounded-xl">
            text-background op bg-primary
          </span>
          <br />
          <span className="text-foreground bg-secondary px-2 py-1 rounded-xl">
            text-foreground op bg-secondary
          </span>
        </div>
      </section>

      {/* Buttons en inputs */}
      <section>
        <h2 className="font-semibold text-lg mb-2">Buttons & Inputs (base styling)</h2>
        <div className="flex gap-4 flex-wrap">
          <button className="bg-primary text-background font-medium rounded-2xl px-4 py-2 hover:bg-primary-light transition">
            Primary Button
          </button>
          <button className="bg-secondary-vibrant text-background font-medium rounded-2xl px-4 py-2 hover:bg-warning transition">
            Secondary Button
          </button>
          <input
            type="text"
            placeholder="Input veld"
            className="border border-border rounded-2xl px-3 py-2 bg-white text-foreground"
          />
        </div>
      </section>
    </div>
  );
}
