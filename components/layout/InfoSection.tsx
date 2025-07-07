'use client';

export function InfoSection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        {/* Titel & Intro */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">Alles wat je nodig hebt</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Van recepten organiseren tot weekmenu&apos;s plannen – wij hebben alles onder één dak.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Weekmenu Planning */}
          <div className="text-center p-8 rounded-2xl bg-gradient-card border border-border/50 hover:shadow-lg transition-all duration-300">
            <div className="w-16 h-16 mx-auto mb-6 bg-gradient-primary rounded-2xl flex items-center justify-center">
              <span className="text-2xl text-primary-foreground">📝</span>
            </div>
            <h3 className="text-xl font-semibold mb-4 text-foreground">Weekmenu Planning</h3>
            <p className="text-muted-foreground">
              Plan je maaltijden voor 9 dagen vooruit. Inclusief datum en dienst planning voor
              perfecte organisatie.
            </p>
          </div>

          {/* Slimme Boodschappenlijst */}
          <div className="text-center p-8 rounded-2xl bg-gradient-card border border-border/50 hover:shadow-lg transition-all duration-300">
            <div className="w-16 h-16 mx-auto mb-6 bg-gradient-secondary rounded-2xl flex items-center justify-center">
              <span className="text-2xl text-secondary-foreground">🛒</span>
            </div>
            <h3 className="text-xl font-semibold mb-4 text-foreground">Slimme Boodschappenlijst</h3>
            <p className="text-muted-foreground">
              Alfabetisch gesorteerd, afvinkbaar en deel met je familie. Wat afgevinkt is, komt in
              de kar.
            </p>
          </div>

          {/* Familie Groepen */}
          <div className="text-center p-8 rounded-2xl bg-gradient-card border border-border/50 hover:shadow-lg transition-all duration-300">
            <div className="w-16 h-16 mx-auto mb-6 bg-gradient-primary rounded-2xl flex items-center justify-center">
              <span className="text-2xl text-primary-foreground">👥</span>
            </div>
            <h3 className="text-xl font-semibold mb-4 text-foreground">Familie Groepen</h3>
            <p className="text-muted-foreground">
              Deel recepten, weekmenu&apos;s en boodschappenlijsten met familie, vrienden of
              specifieke gebruikers.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default InfoSection;
