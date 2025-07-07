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
  ondertitel?: string; // consistent met RecipeForm en firestore schema
  categorieen: Categorie[]; // meerdere categorieën per recept
  ingredienten: Ingredient[]; // nu gestructureerd!
  bereidingswijze: string[]; // stappen als array van string (consistent met RecipeForm)
  afbeeldingUrl?: string; // consistent met rest van je project (liever Engelse naam)
  beschrijving?: string;
  privacy: 'prive' | 'publiek' | 'gedeeld';
  favoritedBy?: string[]; // userId's die dit recept als favoriet hebben
  ownerId: string; // wie het recept gemaakt heeft (voor Firestore-consistentie)
  groupId?: string; // als het bij een groep hoort
  sharedWith?: string[]; // voor gedeelde recepten (groepen/users)
  notities?: { [userId: string]: string }; // optioneel, eigen notities per user
  createdAt?: string; // timestamp/ISO string of Firestore Timestamp (voor sorting)
  updatedAt?: string;
};

// 4. WeekmenuDag (één dag in het weekmenu)
export type WeekmenuDag = {
  dag: string; // bv. "maandag"
  datum: string; // bv. "05/06"
  dienst: string; // bv. "A", "B", "C+", etc.
  maaltijd: string; // vrije tekst, 2-3 regels mogelijk
  receptenIds?: string[]; // optioneel, als je ooit een koppeling wilt met recepten
  notitie?: string; // optioneel, notitie per dag
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

// 8. Groep
export type Groep = {
  id: string;
  naam: string;
  leden: string[]; // user ids
  aangemaaktOp?: string;
};

// Exporteer types zodat je overal consistent kunt importeren
export type {};
