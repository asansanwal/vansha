import type { FamilyTree, Person } from './types';

const STORAGE_KEY = 'vansha_family_tree';

export function getDefaultTree(): FamilyTree {
  return {
    id: 'default',
    name: 'My Family Tree',
    description: 'A family tree created with Vansha',
    rootPersonId: 'p1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    persons: {
      p1: {
        id: 'p1',
        firstName: 'James',
        lastName: 'Wilson',
        gender: 'male',
        birthDate: '1935-03-15',
        birthPlace: 'Boston, Massachusetts',
        deathDate: '2010-11-22',
        deathPlace: 'Boston, Massachusetts',
        photo: '',
        bio: 'A devoted family man and retired school teacher who loved gardening and woodworking.',
        spouseIds: ['p2'],
        childrenIds: ['p3', 'p4'],
        events: [
          { id: 'e1', type: 'military', title: 'Served in the Army', date: '1955-1957', place: 'Fort Bragg, NC' },
          { id: 'e2', type: 'marriage', title: 'Married Eleanor Price', date: '1960-06-18', place: 'St. Mary\'s Church, Boston' },
        ],
      },
      p2: {
        id: 'p2',
        firstName: 'Eleanor',
        lastName: 'Wilson',
        maidenName: 'Price',
        gender: 'female',
        birthDate: '1938-07-22',
        birthPlace: 'New York, New York',
        deathDate: '2018-04-10',
        deathPlace: 'Boston, Massachusetts',
        photo: '',
        bio: 'A talented pianist and loving mother, Eleanor was known for her warm hospitality.',
        spouseIds: ['p1'],
        childrenIds: ['p3', 'p4'],
        events: [
          { id: 'e3', type: 'graduation', title: 'Graduated from Julliard', date: '1959-05-20', place: 'New York, NY' },
        ],
      },
      p3: {
        id: 'p3',
        firstName: 'Robert',
        lastName: 'Wilson',
        gender: 'male',
        birthDate: '1962-01-10',
        birthPlace: 'Boston, Massachusetts',
        photo: '',
        bio: 'An engineer and father of two. Robert carries on the family tradition of community service.',
        fatherId: 'p1',
        motherId: 'p2',
        spouseIds: ['p5'],
        childrenIds: ['p7', 'p8'],
        events: [
          { id: 'e4', type: 'graduation', title: 'Graduated MIT', date: '1984-06-01', place: 'Cambridge, MA' },
          { id: 'e5', type: 'marriage', title: 'Married Susan Chen', date: '1988-09-12', place: 'Boston City Hall' },
        ],
      },
      p4: {
        id: 'p4',
        firstName: 'Margaret',
        lastName: 'Thompson',
        maidenName: 'Wilson',
        gender: 'female',
        birthDate: '1965-09-03',
        birthPlace: 'Boston, Massachusetts',
        photo: '',
        bio: 'A doctor who has dedicated her career to pediatric medicine.',
        fatherId: 'p1',
        motherId: 'p2',
        spouseIds: ['p6'],
        childrenIds: ['p9'],
        events: [
          { id: 'e6', type: 'graduation', title: 'MD from Harvard Medical', date: '1991-05-15', place: 'Boston, MA' },
        ],
      },
      p5: {
        id: 'p5',
        firstName: 'Susan',
        lastName: 'Wilson',
        maidenName: 'Chen',
        gender: 'female',
        birthDate: '1964-04-18',
        birthPlace: 'San Francisco, California',
        photo: '',
        bio: 'A software developer and avid hiker.',
        spouseIds: ['p3'],
        childrenIds: ['p7', 'p8'],
      },
      p6: {
        id: 'p6',
        firstName: 'David',
        lastName: 'Thompson',
        gender: 'male',
        birthDate: '1963-12-01',
        birthPlace: 'Chicago, Illinois',
        photo: '',
        bio: 'A journalist and author.',
        spouseIds: ['p4'],
        childrenIds: ['p9'],
      },
      p7: {
        id: 'p7',
        firstName: 'Emily',
        lastName: 'Wilson',
        gender: 'female',
        birthDate: '1990-05-20',
        birthPlace: 'Boston, Massachusetts',
        photo: '',
        bio: 'A marine biologist studying coral reef conservation.',
        fatherId: 'p3',
        motherId: 'p5',
        spouseIds: [],
        childrenIds: [],
      },
      p8: {
        id: 'p8',
        firstName: 'Michael',
        lastName: 'Wilson',
        gender: 'male',
        birthDate: '1993-08-14',
        birthPlace: 'Boston, Massachusetts',
        photo: '',
        bio: 'A music teacher following in his grandmother Eleanor\'s footsteps.',
        fatherId: 'p3',
        motherId: 'p5',
        spouseIds: [],
        childrenIds: [],
      },
      p9: {
        id: 'p9',
        firstName: 'Sophia',
        lastName: 'Thompson',
        gender: 'female',
        birthDate: '1995-11-30',
        birthPlace: 'Boston, Massachusetts',
        photo: '',
        bio: 'A pre-med student at Stanford University.',
        fatherId: 'p6',
        motherId: 'p4',
        spouseIds: [],
        childrenIds: [],
      },
    },
  };
}

export function loadTree(): FamilyTree {
  if (typeof window === 'undefined') return getDefaultTree();
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored) as FamilyTree;
    } catch {
      return getDefaultTree();
    }
  }
  const tree = getDefaultTree();
  saveTree(tree);
  return tree;
}

export function saveTree(tree: FamilyTree): void {
  if (typeof window === 'undefined') return;
  tree.updatedAt = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tree));
}

export function getPerson(tree: FamilyTree, id: string): Person | undefined {
  return tree.persons[id];
}

export function addPerson(tree: FamilyTree, person: Person): FamilyTree {
  const updated = { ...tree, persons: { ...tree.persons, [person.id]: person } };
  saveTree(updated);
  return updated;
}

export function updatePerson(tree: FamilyTree, person: Person): FamilyTree {
  return addPerson(tree, person);
}

export function deletePerson(tree: FamilyTree, personId: string): FamilyTree {
  const { [personId]: _, ...remainingPersons } = tree.persons;

  // Clean up references in other persons
  for (const p of Object.values(remainingPersons)) {
    if (p.fatherId === personId) p.fatherId = undefined;
    if (p.motherId === personId) p.motherId = undefined;
    p.spouseIds = p.spouseIds.filter((id) => id !== personId);
    p.childrenIds = p.childrenIds.filter((id) => id !== personId);
  }

  const updated = { ...tree, persons: remainingPersons };
  saveTree(updated);
  return updated;
}

export function searchPersons(tree: FamilyTree, query: string): Person[] {
  const q = query.toLowerCase().trim();
  if (!q) return Object.values(tree.persons);

  return Object.values(tree.persons).filter((p) => {
    const fullName = `${p.firstName} ${p.lastName}`.toLowerCase();
    const maiden = (p.maidenName || '').toLowerCase();
    const birthPlace = (p.birthPlace || '').toLowerCase();
    const bio = (p.bio || '').toLowerCase();
    return (
      fullName.includes(q) ||
      maiden.includes(q) ||
      birthPlace.includes(q) ||
      bio.includes(q)
    );
  });
}

export function getAncestors(tree: FamilyTree, personId: string, depth = 5): Person[] {
  const result: Person[] = [];
  const visited = new Set<string>();

  function walk(id: string, d: number) {
    if (d <= 0 || visited.has(id)) return;
    visited.add(id);
    const person = tree.persons[id];
    if (!person) return;
    result.push(person);
    if (person.fatherId) walk(person.fatherId, d - 1);
    if (person.motherId) walk(person.motherId, d - 1);
  }

  walk(personId, depth);
  return result;
}

export function getDescendants(tree: FamilyTree, personId: string, depth = 5): Person[] {
  const result: Person[] = [];
  const visited = new Set<string>();

  function walk(id: string, d: number) {
    if (d <= 0 || visited.has(id)) return;
    visited.add(id);
    const person = tree.persons[id];
    if (!person) return;
    result.push(person);
    for (const childId of person.childrenIds) {
      walk(childId, d - 1);
    }
  }

  walk(personId, depth);
  return result;
}

export function generateId(): string {
  return 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
