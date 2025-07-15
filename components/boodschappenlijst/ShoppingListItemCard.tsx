// components/boodschappenlijst/ShoppingListItemCard.tsx

import { useState, useRef } from 'react';
import { ShoppingItem } from '@/types';
import { Check, Trash2, AlertCircle, Pencil, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';

type Props = {
  item: ShoppingItem;
  onToggleCheck: () => void;
  onDelete: () => void;
  onEdit?: (newName: string, newQuantity?: string) => void;
};

export function ShoppingListItemCard({ item, onToggleCheck, onDelete, onEdit }: Props) {
  const checked = item.checked;
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(item.name);
  const [editQuantity, setEditQuantity] = useState(item.quantity || '');
  const inputRef = useRef<HTMLInputElement>(null);

  // Start editing
  const handleEditClick = () => {
    setEditName(item.name);
    setEditQuantity(item.quantity || '');
    setEditing(true);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  // Commit edit
  const commitEdit = () => {
    if (!editName.trim()) {
      setEditing(false);
      return;
    }
    if (onEdit) {
      // Let op: geef expliciet '' (lege string) door als veld leeg is
      onEdit(editName.trim(), editQuantity.trim());
    }
    setEditing(false);
  };

  // Cancel edit
  const cancelEdit = () => {
    setEditing(false);
    setEditName(item.name);
    setEditQuantity(item.quantity || '');
  };

  // Handle key events in input
  const handleInputKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      commitEdit();
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  };

  return (
    <div
      className={`
        group flex items-center gap-3 justify-between rounded-xl px-4 py-2 border border-border
        transition
        ${checked ? 'bg-muted' : 'bg-gradient-card'}
      `}
    >
      {/* Checkbox */}
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        aria-label={checked ? 'Gedaan' : 'Nog doen'}
        tabIndex={0}
        onClick={onToggleCheck}
        className={`
          w-6 h-6 flex items-center justify-center
          border border-border
          bg-white
          rounded-md
          transition
          ${checked ? 'border-primary bg-primary/10' : 'hover:bg-muted'}
        `}
      >
        <AnimatePresence>
          {checked && (
            <motion.span
              key="check"
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              className="text-green-600"
            >
              <Check size={18} strokeWidth={3} />
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* Main content */}
      <div className="flex-1 min-w-0 ml-4 flex items-center gap-2">
        {editing ? (
          <div className="flex items-center gap-2 w-full">
            <input
              ref={inputRef}
              className="border border-border rounded px-2 py-1 text-sm flex-1"
              value={editName}
              onChange={e => setEditName(e.target.value)}
              onKeyDown={handleInputKey}
              // let op: geen onBlur meer hier
            />
            <input
              className="border border-border rounded px-2 py-1 text-xs w-16"
              placeholder="Aantal"
              value={editQuantity}
              onChange={e => setEditQuantity(e.target.value)}
              onKeyDown={handleInputKey}
              // let op: geen onBlur meer hier
            />
            <button
              type="button"
              className="text-muted-foreground hover:text-destructive ml-1"
              tabIndex={0}
              onClick={cancelEdit}
              aria-label="Annuleer"
            >
              <X size={16} />
            </button>
            <button
              type="button"
              className="text-green-600 ml-1"
              tabIndex={0}
              onClick={commitEdit}
              aria-label="Opslaan"
            >
              <Check size={16} />
            </button>
          </div>
        ) : (
          <>
            <span
              className={`
                font-medium truncate
                ${checked ? 'line-through text-muted-foreground' : ''}
              `}
            >
              {item.name}
            </span>
            {item.urgent && (
              <Badge
                variant="destructive"
                className={`
                  text-xs flex items-center gap-1
                  ${checked ? 'line-through opacity-60' : ''}
                `}
              >
                <AlertCircle size={14} className="inline" />
                Belangrijk
              </Badge>
            )}
            {item.promo && (
              <Badge
                variant="outline"
                className="border-orange-400 text-orange-700 bg-orange-50 text-xs flex items-center gap-1"
              >
                Mits aanbieding
              </Badge>
            )}
            {item.quantity && (
              <span className="text-base font-medium text-black ml-2">{item.quantity}x</span>
            )}
          </>
        )}
      </div>
      {/* Rechts: Edit & Delete alleen als niet afgevinkt */}
      {!checked && !editing && (
        <div className="flex items-center gap-2 ml-4">
          <button
            type="button"
            aria-label="Bewerk item"
            className="text-green-600  bg-green-600/10 hover:bg-green-600/20 p-2 rounded transition"
            tabIndex={0}
            onClick={handleEditClick}
          >
            <Pencil size={18} />
          </button>
          <button
            type="button"
            aria-label="Verwijder item"
            className="text-destructive bg-destructive/10 hover:bg-destructive/20 p-2 rounded transition"
            tabIndex={0}
            onClick={onDelete}
          >
            <Trash2 size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
