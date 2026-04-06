// 1. Gebruiker (User)
export type User = {
  id: string;
  naam: string;
  email: string;
  photoURL?: string;
  groepen?: string[]; // id's van groepen waar deze user in zit
};

// 2. Categorien (optioneel: importeer als type uit categorieen.ts, of gewoon string[])
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
  bereidingsTijd: string;
  aantalPersonen: number;
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

export type ReceptInput = Omit<
  Recept,
  'id' | 'ownerId' | 'createdAt' | 'updatedAt' | 'favoritedBy'
> & {
  favoritedBy?: string[];
};

// 4. WeekmenuDag
export type WeekmenuDag = {
  id: string;
  dag: string;
  datum: string;
  dienst: string;
  maaltijd: string;
  notitie?: string;
  receptenIds?: string[];
  isEditing?: boolean;
};

// 5. Weekmenu
export type Weekmenu = {
  id: string;
  ownerId: string;
  groupId?: string;
  startDatum: string;
  dagen: WeekmenuDag[];
  privacy: 'prive' | 'gedeeld' | 'publiek';
  sharedWith?: string[];
  createdAt?: string;
  updatedAt?: string;
};

// 6. Boodschappen-item
export type BoodschappenItem = {
  naam: string;
  aantal: number;
  eenheid?: string;
  checked: boolean;
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
  leden: string[];
  eigenaar: string;
  aangemaaktOp: string;
};

// Boodschappenlijst
export type ShoppingItem = {
  id: string;
  name: string;
  quantity?: string;
  checked: boolean;
  urgent?: boolean;
  promo?: boolean;
  category?: ShoppingCategory;
  createdAt: number;
};

export type ShoppingCategory = 'Groente' | 'Fruit' | 'Vlees' | 'Diepvries';

export const SHOPPING_CATEGORIES: ShoppingCategory[] = [
  'Groente',
  'Fruit',
  'Vlees',
  'Diepvries',
];
