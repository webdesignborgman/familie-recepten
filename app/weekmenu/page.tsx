'use client';

import { useAuth } from '@/components/auth/AuthProvider';

export default function WeekmenuPage() {
  const { user, loading } = useAuth();

  if (loading) return <div>Laden...</div>;

  if (user) {
    // Ingelogd: echt weekmenu
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">Jouw weekmenu</h1>
        <p>Hier kun je je eigen weekmenu maken en beheren.</p>
        {/* TODO: Voeg hier je Weekmenu component toe */}
      </div>
    );
  }

  // Niet ingelogd: demo/teaser + call-to-action
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Weekmenu (demo)</h1>
      <div className="mb-4">
        <div className="p-4 rounded-xl bg-[hsl(210,100%,92%)] mb-2">
          <strong>Maandag:</strong> Stamppot boerenkool
        </div>
        <div className="p-4 rounded-xl bg-[hsl(31,81%,91%)] mb-2">
          <strong>Dinsdag:</strong> Gevulde paprika’s
        </div>
        <div className="p-4 rounded-xl bg-[hsl(142,69%,58%)]/20">
          <strong>Woensdag:</strong> Zalm uit de oven
        </div>
      </div>
      <div className="bg-white p-4 rounded-xl border mt-6">
        <p>
          Maak een account om je eigen weekmenu te maken en te delen! <br />
          <a
            href="/auth/register"
            className="text-[hsl(210,100%,56%)] font-medium underline underline-offset-2 hover:text-[hsl(142,76%,36%)]"
          >
            Registreren &rarr;
          </a>
        </p>
      </div>
    </div>
  );
}
