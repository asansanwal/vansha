export interface Person {
  id: string;
  firstName: string;
  lastName: string;
  maidenName?: string;
  gender: 'male' | 'female' | 'other';
  birthDate?: string;
  birthPlace?: string;
  deathDate?: string;
  deathPlace?: string;
  photo?: string;
  bio?: string;
  fatherId?: string;
  motherId?: string;
  spouseIds: string[];
  childrenIds: string[];
  events?: LifeEvent[];
}

export interface LifeEvent {
  id: string;
  type: 'birth' | 'death' | 'marriage' | 'graduation' | 'immigration' | 'military' | 'custom';
  title: string;
  date?: string;
  place?: string;
  description?: string;
}

export interface FamilyTree {
  id: string;
  name: string;
  description?: string;
  rootPersonId: string;
  persons: Record<string, Person>;
  createdAt: string;
  updatedAt: string;
}
