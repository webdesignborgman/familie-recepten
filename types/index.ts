// types/index.ts

// 1. Gebruiker (User)
export type User = {
  id: string;
  naam: string;
  email: string;
  photoURL?: string;
  groepen?: string[]; // id's van groepen waar deze user in zit
};

// 2. Categorieën (optioneel: importeer als type uit categorieen.ts, of gewoon string[])
export type Categorie = string; // Of import { Categorie } from './categorieen'

// 3. Recept
export type Ingredient = {
  naam: string;
  hoeveelheid: string;
};

export type Recept = {
  id: string;
  titel: string;
  ondertitel?: string;
  categorieen: Categorie[];
  ingredienten: Ingredient[];
  bereidingswijze: string[];
  bereidingsTijd: string; // <-- toegevoegd!
  aantalPersonen: number; // <-- toegevoegd!
  afbeeldingUrl?: string;
  beschrijving?: string;
  privacy: 'prive' | 'publiek' | 'gedeeld';
  favoritedBy?: string[];
  ownerId: string;
  groupId?: string;
  sharedWith?: string[];
  notities?: { [userId: string]: string };
  createdAt?: string;
  updatedAt?: string;
};

// *** Toegevoegd: Input type voor recepten (zonder id, ownerId, createdAt, etc.) ***
export type ReceptInput = Omit<
  Recept,
  'id' | 'ownerId' | 'createdAt' | 'updatedAt' | 'favoritedBy'
> & {
  favoritedBy?: string[]; // mag leeg zijn bij aanmaken
};

// 4. WeekmenuDag (één dag in het weekmenu)
export type WeekmenuDag = {
  id: string;
  dag: string; // "Zaterdag" etc.
  datum: string; // bv "05/06"
  dienst: string; // max 3 chars, bv "A"
  maaltijd: string; // max 2-3 regels tekst
  notitie?: string; // optioneel, notitie per dag
  receptenIds?: string[]; // optioneel, als je ooit een koppeling wilt met recepten
  isEditing?: boolean; // voor lokale UI state
};

// 5. Weekmenu
export type Weekmenu = {
  id: string;
  ownerId: string; // consistent met Recept
  groupId?: string;
  startDatum: string; // bv. "05/06" (eerste zaterdag)
  dagen: WeekmenuDag[]; // altijd 9 items
  privacy: 'prive' | 'gedeeld' | 'publiek';
  sharedWith?: string[];
  createdAt?: string;
  updatedAt?: string;
};

// 6. Boodschappen-item
export type BoodschappenItem = {
  naam: string;
  aantal: number;
  eenheid?: string; // bv. "g", "ml", "stuks"
  checked: boolean; // afgevinkt/in de kar?
};

// 7. Boodschappenlijst
export type BoodschappenLijst = {
  id: string;
  ownerId: string;
  groupId?: string;
  naam: string;
  items: BoodschappenItem[];
  privacy: 'prive' | 'gedeeld' | 'publiek';
  sharedWith?: string[];
  createdAt?: string;
  updatedAt?: string;
};

// 8. Groep (voor gedeelde recepten, weekmenu's, etc.)

export type Groep = {
  id: string;
  naam: string;
  leden: string[]; // userId's
  eigenaar: string; // userId van de eigenaar/beheerder
  aangemaaktOp: string; // of Firestore Timestamp
};
