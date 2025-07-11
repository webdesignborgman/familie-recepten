'use client';

import { useAuth } from '@/components/auth/AuthProvider';

export default function BoodschappenlijstPage() {
  const { user, loading } = useAuth();

  if (loading) return <div>Laden...</div>;

  if (user) {
    // Ingelogd: echte boodschappenlijst
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">Jouw boodschappenlijst</h1>
        <p>Maak, deel en vink je boodschappenlijst makkelijk af.</p>
        {/* TODO: Voeg hier je BoodschappenLijst component toe */}
      </div>
    );
  }

  // Niet ingelogd: demo/teaser + call-to-action
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Boodschappenlijst (demo)</h1>
      <ul className="mb-4 space-y-2">
        <li className="p-2 bg-[hsl(210,100%,92%)] rounded-lg">Aardappelen</li>
        <li className="p-2 bg-[hsl(31,81%,91%)] rounded-lg">Kipfilet</li>
        <li className="p-2 bg-[hsl(142,69%,58%)]/20 rounded-lg">Tomaten</li>
      </ul>
      <div className="bg-white p-4 rounded-xl border mt-6">
        <p>
          Maak een gratis account om je eigen boodschappenlijst te bewaren en delen! <br />
          <a
            href="/auth/register"
            className="text-[hsl(210,100%,56%)] font-medium underline underline-offset-2 hover:text-[hsl(142,76%,36%)]"
          >
            Account aanmaken &rarr;
          </a>
        </p>
      </div>
    </div>
  );
}
