import { useState, useEffect, useMemo } from 'react';
import type { FamilyTree, Person } from '../lib/types';
import { loadTree, searchPersons } from '../lib/store';

export function SearchPanel() {
  const [tree, setTree] = useState<FamilyTree | null>(null);
  const [query, setQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState<string>('all');
  const [livingFilter, setLivingFilter] = useState<string>('all');

  useEffect(() => {
    setTree(loadTree());
  }, []);

  const results = useMemo(() => {
    if (!tree) return [];
    let persons = searchPersons(tree, query);

    if (genderFilter !== 'all') {
      persons = persons.filter((p) => p.gender === genderFilter);
    }
    if (livingFilter === 'living') {
      persons = persons.filter((p) => !p.deathDate);
    } else if (livingFilter === 'deceased') {
      persons = persons.filter((p) => !!p.deathDate);
    }

    return persons.sort((a, b) => a.lastName.localeCompare(b.lastName));
  }, [tree, query, genderFilter, livingFilter]);

  if (!tree) return <div className="search-loading">Loading...</div>;

  const totalPersons = Object.keys(tree.persons).length;

  return (
    <div className="search-panel">
      <div className="search-bar">
        <div className="search-input-wrap">
          <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search by name, location, or biography..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="search-input"
            autoFocus
          />
          {query && (
            <button className="search-clear" onClick={() => setQuery('')}>&times;</button>
          )}
        </div>
        <div className="search-filters">
          <select value={genderFilter} onChange={(e) => setGenderFilter(e.target.value)}>
            <option value="all">All Genders</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          <select value={livingFilter} onChange={(e) => setLivingFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="living">Living</option>
            <option value="deceased">Deceased</option>
          </select>
        </div>
      </div>

      <div className="search-meta">
        Showing {results.length} of {totalPersons} people
        {query && <span> matching "<strong>{query}</strong>"</span>}
      </div>

      <div className="search-results">
        {results.length === 0 ? (
          <div className="search-empty">
            <h3>No results found</h3>
            <p>Try a different search term or adjust your filters.</p>
          </div>
        ) : (
          results.map((person) => (
            <SearchResultCard key={person.id} person={person} />
          ))
        )}
      </div>
    </div>
  );
}

function SearchResultCard({ person }: { person: Person }) {
  const isDeceased = !!person.deathDate;

  return (
    <a href={`/person/${person.id}`} className="search-result card">
      <div className={`result-avatar gender-${person.gender}`}>
        {person.photo ? (
          <img src={person.photo} alt={person.firstName} />
        ) : (
          <span>{person.firstName[0]}{person.lastName[0]}</span>
        )}
      </div>
      <div className="result-info">
        <h3>{person.firstName} {person.lastName}</h3>
        {person.maidenName && <span className="result-maiden">née {person.maidenName}</span>}
        <div className="result-details">
          {person.birthDate && <span>{person.birthDate.slice(0, 4)}</span>}
          {person.birthDate && <span>—</span>}
          {isDeceased ? <span>{person.deathDate!.slice(0, 4)}</span> : person.birthDate && <span>Present</span>}
          {person.birthPlace && <span className="result-place">📍 {person.birthPlace}</span>}
        </div>
        {person.bio && <p className="result-bio">{person.bio.slice(0, 120)}{person.bio.length > 120 ? '...' : ''}</p>}
      </div>
      <div className="result-arrow">→</div>
    </a>
  );
}
