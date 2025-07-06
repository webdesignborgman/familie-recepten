// types/index.ts

// ------ Gebruikte Types ------

// 1. Gebruiker (User)
export type User = {
  id: string;
  naam: string;
  email: string;
  photoURL?: string;
  groepen?: string[]; // id's van groepen waar deze user in zit
};

// 2. Categorieën (optioneel: importeer als type uit categorieen.ts)
import { Categorie } from './categorieen';

// 3. Recept
export type Recept = {
  id: string;
  titel: string;
  subtitel?: string;
  categorieen: Categorie[]; // meerdere categorieën per recept
  ingredienten: string[];
  stappen: string[];
  fotoURL?: string;
  privacy: 'prive' | 'publiek' | 'gedeeld';
  eigenaar: string; // user id
  gedeeldMet?: string[]; // user-ids of groeps-ids
  aangemaaktOp?: string; // timestamp/ISO string
};

// 4. WeekmenuDag (één dag in het weekmenu)
export type WeekmenuDag = {
  dag: string; // bv. "maandag"
  datum: string; // bv. "05/06"
  dienst: string; // bv. "A", "B", "C+", etc.
  maaltijd: string; // vrije tekst, 2-3 regels mogelijk
};

// 5. Weekmenu
export type Weekmenu = {
  id: string;
  dagen: WeekmenuDag[];
  eigenaar: string; // user id
  privacy: 'prive' | 'gedeeld' | 'publiek';
  gedeeldMet?: string[]; // user-ids of groeps-ids
  aangemaaktOp?: string; // timestamp/ISO string
};

// 6. Boodschappen-item
export type BoodschappenItem = {
  id: string;
  naam: string;
  gekocht: boolean; // afgevinkt/in de kar?
  aangemaaktDoor: string; // user id
  categorie?: string; // optioneel, handig voor sorteren/groeperen
  hoeveelheid?: string; // bv. "2 stuks", "500g", etc.
  eenheid?: string; // optioneel, bv. "g", "ml"
};

// 7. Boodschappenlijst
export type BoodschappenLijst = {
  id: string;
  items: BoodschappenItem[];
  eigenaar: string; // user id
  privacy: 'prive' | 'gedeeld' | 'publiek';
  gedeeldMet?: string[]; // user-ids of groeps-ids
  aangemaaktOp?: string; // timestamp/ISO string
};

// 8. Groep
export type Groep = {
  id: string;
  naam: string;
  leden: string[]; // user ids
  aangemaaktOp?: string;
};

// Je kunt types makkelijk uitbreiden/aanpassen als je meer features toevoegt.
