import { useState, useEffect } from 'react';
import type { FamilyTree, Person } from '../lib/types';
import { loadTree, addPerson, updatePerson, generateId, saveTree } from '../lib/store';

interface Props {
  editPersonId?: string;
}

export function PersonForm({ editPersonId }: Props) {
  const [tree, setTree] = useState<FamilyTree | null>(null);
  const [saved, setSaved] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [maidenName, setMaidenName] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [birthDate, setBirthDate] = useState('');
  const [birthPlace, setBirthPlace] = useState('');
  const [deathDate, setDeathDate] = useState('');
  const [deathPlace, setDeathPlace] = useState('');
  const [bio, setBio] = useState('');
  const [fatherId, setFatherId] = useState('');
  const [motherId, setMotherId] = useState('');
  const [spouseId, setSpouseId] = useState('');

  useEffect(() => {
    const t = loadTree();
    setTree(t);

    if (editPersonId && t.persons[editPersonId]) {
      const p = t.persons[editPersonId];
      setFirstName(p.firstName);
      setLastName(p.lastName);
      setMaidenName(p.maidenName || '');
      setGender(p.gender);
      setBirthDate(p.birthDate || '');
      setBirthPlace(p.birthPlace || '');
      setDeathDate(p.deathDate || '');
      setDeathPlace(p.deathPlace || '');
      setBio(p.bio || '');
      setFatherId(p.fatherId || '');
      setMotherId(p.motherId || '');
      setSpouseId(p.spouseIds[0] || '');
    }
  }, [editPersonId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tree || !firstName.trim() || !lastName.trim()) return;

    const id = editPersonId || generateId();
    const existingPerson = editPersonId ? tree.persons[editPersonId] : undefined;

    const person: Person = {
      id,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      maidenName: maidenName.trim() || undefined,
      gender,
      birthDate: birthDate || undefined,
      birthPlace: birthPlace.trim() || undefined,
      deathDate: deathDate || undefined,
      deathPlace: deathPlace.trim() || undefined,
      bio: bio.trim() || undefined,
      fatherId: fatherId || undefined,
      motherId: motherId || undefined,
      spouseIds: spouseId ? [spouseId] : (existingPerson?.spouseIds || []),
      childrenIds: existingPerson?.childrenIds || [],
      events: existingPerson?.events || [],
    };

    let updatedTree: FamilyTree;

    if (editPersonId) {
      updatedTree = updatePerson(tree, person);
    } else {
      updatedTree = addPerson(tree, person);
    }

    // Update parent's childrenIds
    if (fatherId && updatedTree.persons[fatherId]) {
      const father = updatedTree.persons[fatherId];
      if (!father.childrenIds.includes(id)) {
        father.childrenIds = [...father.childrenIds, id];
      }
    }

    if (motherId && updatedTree.persons[motherId]) {
      const mother = updatedTree.persons[motherId];
      if (!mother.childrenIds.includes(id)) {
        mother.childrenIds = [...mother.childrenIds, id];
      }
    }

    // Update spouse references
    if (spouseId && updatedTree.persons[spouseId]) {
      const spouse = updatedTree.persons[spouseId];
      if (!spouse.spouseIds.includes(id)) {
        spouse.spouseIds = [...spouse.spouseIds, id];
      }
    }

    saveTree(updatedTree);
    setTree(updatedTree);
    setSaved(true);

    if (!editPersonId) {
      // Redirect to the new person's profile
      window.location.href = `/person/${id}`;
    }
  };

  if (!tree) return <div>Loading...</div>;

  const persons = Object.values(tree.persons).sort((a, b) =>
    `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
  );

  const males = persons.filter((p) => p.gender === 'male');
  const females = persons.filter((p) => p.gender === 'female');

  return (
    <form className="person-form" onSubmit={handleSubmit}>
      {saved && (
        <div className="form-success">
          ✓ {editPersonId ? 'Profile updated' : 'Person added'} successfully!
          {editPersonId && <a href={`/person/${editPersonId}`}>View profile →</a>}
        </div>
      )}

      <fieldset className="form-section">
        <legend>Basic Information</legend>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="firstName">First Name *</label>
            <input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              placeholder="Enter first name"
            />
          </div>
          <div className="form-group">
            <label htmlFor="lastName">Last Name *</label>
            <input
              id="lastName"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              placeholder="Enter last name"
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="maidenName">Maiden Name</label>
            <input
              id="maidenName"
              type="text"
              value={maidenName}
              onChange={(e) => setMaidenName(e.target.value)}
              placeholder="If applicable"
            />
          </div>
          <div className="form-group">
            <label htmlFor="gender">Gender *</label>
            <select id="gender" value={gender} onChange={(e) => setGender(e.target.value as 'male' | 'female' | 'other')}>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </fieldset>

      <fieldset className="form-section">
        <legend>Birth & Death</legend>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="birthDate">Birth Date</label>
            <input
              id="birthDate"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="birthPlace">Birth Place</label>
            <input
              id="birthPlace"
              type="text"
              value={birthPlace}
              onChange={(e) => setBirthPlace(e.target.value)}
              placeholder="City, State/Country"
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="deathDate">Death Date</label>
            <input
              id="deathDate"
              type="date"
              value={deathDate}
              onChange={(e) => setDeathDate(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="deathPlace">Death Place</label>
            <input
              id="deathPlace"
              type="text"
              value={deathPlace}
              onChange={(e) => setDeathPlace(e.target.value)}
              placeholder="City, State/Country"
            />
          </div>
        </div>
      </fieldset>

      <fieldset className="form-section">
        <legend>Family Connections</legend>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="fatherId">Father</label>
            <select id="fatherId" value={fatherId} onChange={(e) => setFatherId(e.target.value)}>
              <option value="">— Select Father —</option>
              {males.filter((p) => p.id !== editPersonId).map((p) => (
                <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="motherId">Mother</label>
            <select id="motherId" value={motherId} onChange={(e) => setMotherId(e.target.value)}>
              <option value="">— Select Mother —</option>
              {females.filter((p) => p.id !== editPersonId).map((p) => (
                <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="spouseId">Spouse</label>
            <select id="spouseId" value={spouseId} onChange={(e) => setSpouseId(e.target.value)}>
              <option value="">— Select Spouse —</option>
              {persons.filter((p) => p.id !== editPersonId).map((p) => (
                <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>
              ))}
            </select>
          </div>
        </div>
      </fieldset>

      <fieldset className="form-section">
        <legend>Biography</legend>
        <div className="form-group">
          <label htmlFor="bio">About this person</label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Write a short biography or notes about this person..."
            rows={4}
          />
        </div>
      </fieldset>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary">
          {editPersonId ? 'Update Profile' : 'Add to Family Tree'}
        </button>
        <a href={editPersonId ? `/person/${editPersonId}` : '/tree'} className="btn btn-secondary">
          Cancel
        </a>
      </div>
    </form>
  );
}
