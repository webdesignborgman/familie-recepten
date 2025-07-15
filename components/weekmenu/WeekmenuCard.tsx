'use client';
import { useState, useEffect } from 'react';
import { ChefHat, SquarePen, GripVertical, StickyNote, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { WeekmenuDag } from '@/types';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';

interface CardProps {
  dag: WeekmenuDag;
  editing: boolean;
  onEdit: () => void;
  onSave: (dag: WeekmenuDag) => void;
  onCancel: () => void;
  dragId: string;
  dragDisabled?: boolean;
  notitieEditing: boolean;
  onNotitieEdit: () => void;
  onNotitieCancel: () => void;
  onSaveNotitie: (dag: WeekmenuDag) => void;
}

export function WeekmenuCard({
  dag,
  editing,
  onEdit,
  onSave,
  onCancel,
  dragId,
  dragDisabled = false,
  notitieEditing,
  onNotitieEdit,
  onNotitieCancel,
  onSaveNotitie,
}: CardProps) {
  const [editDatum, setEditDatum] = useState(dag.datum);
  const [editDienst, setEditDienst] = useState(dag.dienst);
  const [editMaaltijd, setEditMaaltijd] = useState(dag.maaltijd);
  const [editNotitie, setEditNotitie] = useState(dag.notitie ?? '');

  useEffect(() => {
    setEditDatum(dag.datum);
    setEditDienst(dag.dienst);
    setEditMaaltijd(dag.maaltijd);
  }, [dag, editing]);

  useEffect(() => {
    setEditNotitie(dag.notitie ?? '');
  }, [dag, notitieEditing]);

  // Gebruik useSortable voor echte drag & drop
  const { setNodeRef, listeners, attributes, transform, transition, isDragging } = useSortable({
    id: dragId,
    disabled: dragDisabled || editing || notitieEditing,
  });

  // CSS transform vanuit dnd-kit
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 40 : undefined,
  };

  // Framer Motion variants
  const dragVariants = {
    rest: {
      scale: 1,
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      backgroundColor: 'rgba(255,255,255,1)',
      transition: { type: 'spring', stiffness: 380, damping: 24 },
    },
    drag: {
      scale: 1.05,
      boxShadow: '0 8px 32px 0 rgba(31, 110, 63, 0.16)',
      backgroundColor: 'rgba(232,255,238,0.7)',
      transition: { type: 'spring', stiffness: 380, damping: 24 },
    },
  } as const;

  function handleSave() {
    onSave({
      ...dag,
      datum: editDatum,
      dienst: editDienst.slice(0, 3),
      maaltijd: editMaaltijd,
    });
  }

  function handleSaveNotitie() {
    onSaveNotitie({
      ...dag,
      notitie: editNotitie,
    });
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      animate={isDragging ? 'drag' : 'rest'}
      variants={dragVariants}
      className={`bg-gradient-to-br from-[hsl(210,100%,92%)] via-white to-[hsl(142,69%,58%)/0.10]
        rounded-xl shadow-sm border border-border/50 px-4 py-3 transition-all relative min-h-[70px]
        ${
          editing || notitieEditing
            ? 'grid grid-cols-[56px_120px_54px_1.5fr_auto] grid-rows-1 items-center gap-x-2'
            : 'grid grid-cols-[56px_120px_54px_1.5fr_auto_auto_auto] grid-rows-2 items-center gap-x-2 gap-y-1'
        }
      `}
    >
      {/* ChefHat */}
      <div
        className={editing || notitieEditing ? '' : 'row-span-2 flex items-center justify-center'}
      >
        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-primary to-primary-light">
          <ChefHat className="w-5 h-5 text-white" />
        </div>
      </div>

      {/* Dag & Datum */}
      <div
        className={
          editing || notitieEditing
            ? 'flex flex-col justify-center'
            : 'flex flex-col justify-center row-span-2'
        }
      >
        <div className="font-bold text-base text-foreground truncate">{dag.dag}</div>
        {editing ? (
          <input
            className="w-16 rounded border px-2 py-1 text-xs mt-1"
            value={editDatum}
            maxLength={5}
            placeholder="DD-MM"
            onChange={e => setEditDatum(e.target.value)}
          />
        ) : (
          <div className="text-xs text-muted-foreground">{dag.datum}</div>
        )}
      </div>

      {/* Dienst */}
      <div
        className={
          editing || notitieEditing
            ? 'flex items-center justify-center'
            : 'row-span-2 flex items-center justify-center'
        }
      >
        {editing ? (
          <input
            className="w-14 text-lg text-center font-bold rounded-full border-2 px-2 py-2 bg-tertiary text-white"
            value={editDienst}
            maxLength={3}
            onChange={e => setEditDienst(e.target.value)}
          />
        ) : (
          <span className="inline-flex items-center justify-center rounded-full border-2 font-bold text-lg font-mono min-w-[2ch] text-center bg-tertiary-light px-3 py-1">
            {dag.dienst || '–'}
          </span>
        )}
      </div>

      {/* Maaltijd of Notitie-edit */}
      {editing ? (
        <>
          <textarea
            rows={1}
            className="w-full rounded border px-2 py-1 text-base font-medium resize-none"
            value={editMaaltijd}
            onChange={e => setEditMaaltijd(e.target.value)}
            placeholder="Maaltijd"
            maxLength={120}
            autoFocus
          />
          <div className="flex items-center gap-1 ml-2">
            <button
              // Drag is uitgeschakeld tijdens edit
              {...listeners}
              {...attributes}
              disabled
              className="text-muted-foreground hover:text-primary p-1"
            >
              <GripVertical className="w-5 h-5" />
            </button>
            <Button
              className="bg-success hover:bg-green-700 text-white p-1 h-8 w-8"
              size="icon"
              onClick={handleSave}
            >
              <Check className="w-5 h-5" />
            </Button>
            <Button
              className="bg-destructive hover:bg-red-700 text-white p-1 h-8 w-8"
              size="icon"
              onClick={onCancel}
            >
              <X className="w-5 h-5" />
            </Button>
            <Button className="p-1 h-8 w-8 bg-muted" size="icon" onClick={onNotitieEdit}>
              <StickyNote className="w-5 h-5" />
            </Button>
          </div>
        </>
      ) : notitieEditing ? (
        <>
          <textarea
            rows={1}
            className="w-full rounded border px-2 py-1 text-sm mt-1"
            value={editNotitie}
            onChange={e => setEditNotitie(e.target.value)}
            placeholder="Notitie (optioneel)"
            maxLength={140}
            autoFocus
          />
          <div className="flex items-center gap-1 ml-2">
            <Button
              className="bg-success hover:bg-green-700 text-white p-1 h-8 w-8"
              size="icon"
              onClick={handleSaveNotitie}
            >
              <Check className="w-5 h-5" />
            </Button>
            <Button
              className="bg-destructive hover:bg-red-700 text-white p-1 h-8 w-8"
              size="icon"
              onClick={onNotitieCancel}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="row-span-2 flex items-center min-w-0">
            <div className="text-base font-medium text-foreground line-clamp-2">{dag.maaltijd}</div>
          </div>
          <div className="row-span-2 flex items-center justify-center">
            <Button
              className="bg-gradient-primary text-white"
              variant="ghost"
              size="icon"
              onClick={onEdit}
              title="Bewerken"
            >
              <SquarePen className="w-4 h-4" />
            </Button>
            <Button
              className="bg-muted"
              variant="ghost"
              size="icon"
              onClick={onNotitieEdit}
              title="Notitie"
            >
              <StickyNote className="w-4 h-4" />
            </Button>
            <button
              {...listeners}
              {...attributes}
              className="bg-muted text-muted-foreground rounded p-4 hover:text-orange-500 hover:bg-muted-foreground/10"
              title="Sleep maaltijd"
            >
              <GripVertical className="w-4 h-4" />
            </button>
          </div>
        </>
      )}

      {/* Notitie weergeven */}
      {!editing && !notitieEditing && dag.notitie && (
        <div className="col-span-full mt-2 text-xs text-muted-foreground flex items-center gap-2">
          <StickyNote className="w-4 h-4" />
          {dag.notitie}
        </div>
      )}
    </motion.div>
  );
}
