import { useState, useEffect, useCallback, useRef } from 'react';
import type { FamilyTree, Person } from '../lib/types';
import { loadTree, getPerson } from '../lib/store';
import { PersonNode } from './PersonNode.tsx';

interface TreeNode {
  person: Person;
  spouse?: Person;
  children: TreeNode[];
}

function buildTree(tree: FamilyTree, rootId: string, visited = new Set<string>()): TreeNode | null {
  if (visited.has(rootId)) return null;
  visited.add(rootId);

  const person = getPerson(tree, rootId);
  if (!person) return null;

  const spouse = person.spouseIds.length > 0 ? getPerson(tree, person.spouseIds[0]) : undefined;
  if (spouse) visited.add(spouse.id);

  const children: TreeNode[] = [];
  for (const childId of person.childrenIds) {
    const childNode = buildTree(tree, childId, visited);
    if (childNode) children.push(childNode);
  }

  return { person, spouse, children };
}

export function FamilyTreeViewer() {
  const [tree, setTree] = useState<FamilyTree | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTree(loadTree());
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setZoom((z) => Math.max(0.3, Math.min(2, z - e.deltaY * 0.001)));
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0 && (e.target as HTMLElement).closest('.tree-canvas')) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  }, [pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning) {
      setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
    }
  }, [isPanning, panStart]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  if (!tree) {
    return <div className="tree-loading">Loading family tree...</div>;
  }

  const rootNode = buildTree(tree, tree.rootPersonId);

  if (!rootNode) {
    return (
      <div className="tree-empty">
        <h2>No Family Tree Yet</h2>
        <p>Start by adding your first family member.</p>
        <a href="/add" className="btn btn-primary">Add First Person</a>
      </div>
    );
  }

  return (
    <div className="tree-viewer">
      <div className="tree-controls">
        <button onClick={() => setZoom((z) => Math.min(2, z + 0.15))} title="Zoom in">+</button>
        <span className="zoom-level">{Math.round(zoom * 100)}%</span>
        <button onClick={() => setZoom((z) => Math.max(0.3, z - 0.15))} title="Zoom out">−</button>
        <button onClick={resetView} title="Reset view" className="reset-btn">⌂</button>
      </div>

      <div
        ref={containerRef}
        className="tree-canvas"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: isPanning ? 'grabbing' : 'grab' }}
      >
        <div
          className="tree-transform"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center top',
          }}
        >
          <TreeBranch node={rootNode} selectedId={selectedId} onSelect={setSelectedId} />
        </div>
      </div>

      {selectedId && tree.persons[selectedId] && (
        <div className="tree-sidebar">
          <PersonSidebar person={tree.persons[selectedId]} tree={tree} onClose={() => setSelectedId(null)} />
        </div>
      )}
    </div>
  );
}

function TreeBranch({ node, selectedId, onSelect }: { node: TreeNode; selectedId: string | null; onSelect: (id: string) => void }) {
  return (
    <div className="tree-branch">
      <div className="tree-couple">
        <PersonNode
          person={node.person}
          isSelected={selectedId === node.person.id}
          onClick={() => onSelect(node.person.id)}
        />
        {node.spouse && (
          <>
            <div className="spouse-connector" />
            <PersonNode
              person={node.spouse}
              isSelected={selectedId === node.spouse.id}
              onClick={() => onSelect(node.spouse!.id)}
            />
          </>
        )}
      </div>
      {node.children.length > 0 && (
        <>
          <div className="vertical-line" />
          <div className="horizontal-line-container">
            <div className="horizontal-line" />
          </div>
          <div className="tree-children">
            {node.children.map((child) => (
              <TreeBranch key={child.person.id} node={child} selectedId={selectedId} onSelect={onSelect} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function PersonSidebar({ person, tree, onClose }: { person: Person; tree: FamilyTree; onClose: () => void }) {
  const father = person.fatherId ? tree.persons[person.fatherId] : undefined;
  const mother = person.motherId ? tree.persons[person.motherId] : undefined;
  const spouses = person.spouseIds.map((id) => tree.persons[id]).filter(Boolean);

  return (
    <div className="sidebar-content">
      <button className="sidebar-close" onClick={onClose}>&times;</button>
      <div className="sidebar-avatar">
        {person.photo ? (
          <img src={person.photo} alt={person.firstName} />
        ) : (
          <div className="avatar-placeholder">{person.firstName[0]}{person.lastName[0]}</div>
        )}
      </div>
      <h3>{person.firstName} {person.lastName}</h3>
      {person.maidenName && <p className="maiden-name">née {person.maidenName}</p>}

      <div className="sidebar-dates">
        {person.birthDate && <span>b. {person.birthDate}</span>}
        {person.deathDate && <span>d. {person.deathDate}</span>}
      </div>

      {person.birthPlace && <p className="sidebar-place">📍 {person.birthPlace}</p>}
      {person.bio && <p className="sidebar-bio">{person.bio}</p>}

      <div className="sidebar-relations">
        {father && (
          <div className="relation">
            <span className="relation-label">Father</span>
            <span>{father.firstName} {father.lastName}</span>
          </div>
        )}
        {mother && (
          <div className="relation">
            <span className="relation-label">Mother</span>
            <span>{mother.firstName} {mother.lastName}</span>
          </div>
        )}
        {spouses.map((s) => (
          <div key={s.id} className="relation">
            <span className="relation-label">Spouse</span>
            <span>{s.firstName} {s.lastName}</span>
          </div>
        ))}
      </div>

      <a href={`/person/${person.id}`} className="btn btn-primary sidebar-btn">View Full Profile</a>
    </div>
  );
}
