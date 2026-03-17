import { useState, useMemo } from 'react';
import { ChevronRight, ChevronDown, Folder as FolderIcon, FolderOpen, Plus } from 'lucide-react';

/**
 * FolderTree — Recursive Component
 *
 * Converts a flat array of folders from the API into a nested tree structure.
 * Each TreeNode recursively renders its children, enabling infinite nesting.
 * The tree is built in O(n) time using a hash map.
 *
 * Precondition:  folders[] is a flat list with { id, name, parent_id } fields.
 * Postcondition: A fully collapsible recursive folder tree is rendered.
 */
export default function FolderTree({ folders, selectedFolderId, onSelectFolder, onCreateFolder }) {
  const tree = useMemo(() => {
    const map = {};
    const roots = [];
    folders.forEach(f => { map[f.id] = { ...f, children: [] }; });
    folders.forEach(f => {
      if (f.parent_id === null || f.parent_id === undefined) roots.push(map[f.id]);
      else if (map[f.parent_id]) map[f.parent_id].children.push(map[f.id]);
    });
    return roots;
  }, [folders]);

  return (
    <div className="space-y-0.5">
      {tree.length === 0 ? (
        <p className="text-slate-400 text-xs text-center py-4">Create your first folder</p>
      ) : (
        tree.map(node => (
          <TreeNode
            key={node.id}
            node={node}
            selectedId={selectedFolderId}
            onSelect={onSelectFolder}
            onCreateSubfolder={onCreateFolder}
          />
        ))
      )}
    </div>
  );
}

// Recursive TreeNode component — renders itself for each child
function TreeNode({ node, level = 0, selectedId, onSelect, onCreateSubfolder }) {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = node.children && node.children.length > 0;
  const isSelected = selectedId === node.id;

  return (
    <div className="w-full animate-slide-in">
      <div
        className={`flex items-center group py-1.5 rounded-lg cursor-pointer transition-all select-none ${
          isSelected
            ? 'bg-blue-100 text-blue-700'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        }`}
        style={{ paddingLeft: `${level * 14 + 8}px`, paddingRight: '8px' }}
        onClick={() => onSelect(node.id, node.name)}
      >
        {/* Expand/Collapse toggle */}
        <button
          onClick={(e) => { e.stopPropagation(); setExpanded(v => !v); }}
          className="w-4 h-4 flex items-center justify-center shrink-0 mr-1 text-slate-400"
          disabled={!hasChildren}
        >
          {hasChildren
            ? expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />
            : <span className="w-3.5 inline-block" />}
        </button>

        {/* Folder icon */}
        {expanded && hasChildren
          ? <FolderOpen className={`w-4 h-4 shrink-0 mr-1.5 ${isSelected ? 'text-blue-500' : 'text-amber-400'}`} />
          : <FolderIcon className={`w-4 h-4 shrink-0 mr-1.5 ${isSelected ? 'text-blue-500' : 'text-amber-400'}`} />}

        <span className="text-xs font-semibold truncate flex-1">{node.name}</span>

        {/* Create subfolder */}
        <button
          onClick={(e) => { e.stopPropagation(); setExpanded(true); onCreateSubfolder(node.id); }}
          className="opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
          title="Add subfolder"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>

      {/* Recursive children */}
      {expanded && hasChildren && (
        <div className="border-l border-slate-200 ml-4">
          {node.children.map(child => (
            <TreeNode
              key={child.id}
              node={child}
              level={level + 1}
              selectedId={selectedId}
              onSelect={onSelect}
              onCreateSubfolder={onCreateSubfolder}
            />
          ))}
        </div>
      )}
    </div>
  );
}
