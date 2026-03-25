import { useState, useEffect } from 'react';
import type { FamilyTree, Person, LifeEvent } from '../lib/types';
import { loadTree } from '../lib/store';

interface Props {
  personId: string;
}

export function PersonProfile({ personId }: Props) {
  const [tree, setTree] = useState<FamilyTree | null>(null);
  const [person, setPerson] = useState<Person | null>(null);

  useEffect(() => {
    const t = loadTree();
    setTree(t);
    setPerson(t.persons[personId] || null);
  }, [personId]);

  if (!tree || !person) {
    return (
      <div className="profile-not-found">
        <h2>Person Not Found</h2>
        <p>The person you're looking for doesn't exist in this family tree.</p>
        <a href="/tree" className="btn btn-primary">Back to Tree</a>
      </div>
    );
  }

  const father = person.fatherId ? tree.persons[person.fatherId] : undefined;
  const mother = person.motherId ? tree.persons[person.motherId] : undefined;
  const spouses = person.spouseIds.map((id) => tree.persons[id]).filter(Boolean);
  const children = person.childrenIds.map((id) => tree.persons[id]).filter(Boolean);
  const siblings = getSiblings(tree, person);

  return (
    <div className="profile">
      <div className="profile-header">
        <div className="profile-avatar-large">
          {person.photo ? (
            <img src={person.photo} alt={person.firstName} />
          ) : (
            <div className={`avatar-large-placeholder gender-${person.gender}`}>
              {person.firstName[0]}{person.lastName[0]}
            </div>
          )}
        </div>
        <div className="profile-header-info">
          <h1>{person.firstName} {person.lastName}</h1>
          {person.maidenName && <p className="profile-maiden">née {person.maidenName}</p>}
          <div className="profile-dates-row">
            {person.birthDate && (
              <span className="profile-date">
                <strong>Born:</strong> {formatDate(person.birthDate)}
                {person.birthPlace && ` in ${person.birthPlace}`}
              </span>
            )}
            {person.deathDate && (
              <span className="profile-date">
                <strong>Died:</strong> {formatDate(person.deathDate)}
                {person.deathPlace && ` in ${person.deathPlace}`}
              </span>
            )}
          </div>
          {person.bio && <p className="profile-bio">{person.bio}</p>}
        </div>
      </div>

      <div className="profile-grid">
        {/* Family Connections */}
        <div className="profile-section card">
          <h2>Family</h2>
          <div className="family-connections">
            {father && (
              <FamilyMember label="Father" person={father} />
            )}
            {mother && (
              <FamilyMember label="Mother" person={mother} />
            )}
            {spouses.map((s) => (
              <FamilyMember key={s.id} label="Spouse" person={s} />
            ))}
            {children.map((c) => (
              <FamilyMember key={c.id} label="Child" person={c} />
            ))}
            {siblings.map((s) => (
              <FamilyMember key={s.id} label="Sibling" person={s} />
            ))}
          </div>
          {father === undefined && mother === undefined && spouses.length === 0 && children.length === 0 && siblings.length === 0 && (
            <p className="profile-empty">No family connections recorded yet.</p>
          )}
        </div>

        {/* Life Events Timeline */}
        <div className="profile-section card">
          <h2>Life Events</h2>
          {person.events && person.events.length > 0 ? (
            <div className="timeline">
              {person.birthDate && (
                <TimelineItem event={{
                  id: 'birth',
                  type: 'birth',
                  title: `Born in ${person.birthPlace || 'Unknown'}`,
                  date: person.birthDate,
                  place: person.birthPlace,
                }} />
              )}
              {person.events.map((event) => (
                <TimelineItem key={event.id} event={event} />
              ))}
              {person.deathDate && (
                <TimelineItem event={{
                  id: 'death',
                  type: 'death',
                  title: `Passed away in ${person.deathPlace || 'Unknown'}`,
                  date: person.deathDate,
                  place: person.deathPlace,
                }} />
              )}
            </div>
          ) : (
            <p className="profile-empty">No life events recorded yet.</p>
          )}
        </div>
      </div>

      <div className="profile-actions">
        <a href="/tree" className="btn btn-secondary">← Back to Tree</a>
        <a href={`/edit/${person.id}`} className="btn btn-primary">Edit Profile</a>
      </div>
    </div>
  );
}

function FamilyMember({ label, person }: { label: string; person: Person }) {
  return (
    <a href={`/person/${person.id}`} className="family-member">
      <div className={`fm-avatar gender-${person.gender}`}>
        {person.firstName[0]}{person.lastName[0]}
      </div>
      <div className="fm-info">
        <span className="fm-label">{label}</span>
        <span className="fm-name">{person.firstName} {person.lastName}</span>
        {person.birthDate && <span className="fm-dates">{person.birthDate.slice(0, 4)}{person.deathDate ? ` – ${person.deathDate.slice(0, 4)}` : ''}</span>}
      </div>
    </a>
  );
}

function TimelineItem({ event }: { event: LifeEvent }) {
  const icons: Record<string, string> = {
    birth: '👶',
    death: '🕊️',
    marriage: '💍',
    graduation: '🎓',
    immigration: '🌍',
    military: '⭐',
    custom: '📌',
  };

  return (
    <div className={`timeline-item type-${event.type}`}>
      <div className="timeline-icon">{icons[event.type] || '📌'}</div>
      <div className="timeline-content">
        <h4>{event.title}</h4>
        {event.date && <span className="timeline-date">{event.date}</span>}
        {event.place && <span className="timeline-place">📍 {event.place}</span>}
        {event.description && <p>{event.description}</p>}
      </div>
    </div>
  );
}

function getSiblings(tree: FamilyTree, person: Person): Person[] {
  const parentIds = [person.fatherId, person.motherId].filter(Boolean) as string[];
  if (parentIds.length === 0) return [];

  const siblingIds = new Set<string>();
  for (const pid of parentIds) {
    const parent = tree.persons[pid];
    if (parent) {
      for (const cid of parent.childrenIds) {
        if (cid !== person.id) siblingIds.add(cid);
      }
    }
  }

  return Array.from(siblingIds).map((id) => tree.persons[id]).filter(Boolean);
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return dateStr;
  }
}
