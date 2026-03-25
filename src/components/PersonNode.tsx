import type { Person } from '../lib/types';

interface PersonNodeProps {
  person: Person;
  isSelected: boolean;
  onClick: () => void;
}

export function PersonNode({ person, isSelected, onClick }: PersonNodeProps) {
  const isDeceased = !!person.deathDate;
  const initials = `${person.firstName[0]}${person.lastName[0]}`;

  return (
    <div
      className={`person-node ${isSelected ? 'selected' : ''} ${isDeceased ? 'deceased' : ''} gender-${person.gender}`}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div className="node-avatar">
        {person.photo ? (
          <img src={person.photo} alt={person.firstName} />
        ) : (
          <span className="node-initials">{initials}</span>
        )}
      </div>
      <div className="node-info">
        <span className="node-name">{person.firstName}</span>
        <span className="node-surname">{person.lastName}</span>
        <span className="node-dates">
          {person.birthDate?.slice(0, 4) || '?'}
          {' — '}
          {person.deathDate?.slice(0, 4) || (isDeceased ? '?' : 'Present')}
        </span>
      </div>
    </div>
  );
}
