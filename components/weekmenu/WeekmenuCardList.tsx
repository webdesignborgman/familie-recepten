'use client';
import { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  type DragEndEvent,
  useDraggable,
  useDroppable,
} from '@dnd-kit/core';
import type { WeekmenuDag } from '@/types';
import { ChefHat, SquarePen, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { updateWeekmenuDagen } from '@/lib/weekmenu-api';

interface Props {
  weekmenuId: string;
  dagen: WeekmenuDag[];
}

export function WeekmenuCardList({ weekmenuId, dagen }: Props) {
  const [items, setItems] = useState<WeekmenuDag[]>(dagen);
  const [editingId, setEditingId] = useState<string | null>(null);

  function handleDragEnd(event: DragEndEvent) {
    const fromId = event.active.id as string;
    const toId = event.over?.id as string | undefined;
    if (!toId || fromId === toId) return;

    const fromIdx = items.findIndex(d => d.id === fromId);
    const toIdx = items.findIndex(d => d.id === toId);
    if (fromIdx === -1 || toIdx === -1) return;

    // Alleen maaltijd wisselen
    const newItems = items.map((item, i) => {
      if (i === fromIdx) return { ...item, maaltijd: items[toIdx].maaltijd };
      if (i === toIdx) return { ...item, maaltijd: items[fromIdx].maaltijd };
      return item;
    });
    setItems(newItems);
    updateWeekmenuDagen(weekmenuId, newItems);
  }

  function handleSaveDag(updated: WeekmenuDag) {
    const newItems = items.map(d => (d.id === updated.id ? updated : d));
    setItems(newItems);
    updateWeekmenuDagen(weekmenuId, newItems);
    setEditingId(null);
  }

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <ul className="flex flex-col gap-4">
        {items.map(dag => (
          <li key={dag.id}>
            <WeekmenuCard
              dag={dag}
              editing={editingId === dag.id}
              onEdit={() => setEditingId(dag.id)}
              onCancel={() => setEditingId(null)}
              onSave={handleSaveDag}
              dragId={dag.id}
              dragDisabled={editingId !== null}
            />
          </li>
        ))}
      </ul>
    </DndContext>
  );
}

interface CardProps {
  dag: WeekmenuDag;
  editing: boolean;
  onEdit: () => void;
  onSave: (dag: WeekmenuDag) => void;
  onCancel: () => void;
  dragId: string;
  dragDisabled?: boolean;
}

function WeekmenuCard({
  dag,
  editing,
  onEdit,
  onSave,
  onCancel,
  dragId,
  dragDisabled = false,
}: CardProps) {
  const [editDag, setEditDag] = useState(dag.dag);
  const [editDatum, setEditDatum] = useState(dag.datum);
  const [editDienst, setEditDienst] = useState(dag.dienst);
  const [editMaaltijd, setEditMaaltijd] = useState(dag.maaltijd);

  useEffect(() => {
    setEditDag(dag.dag);
    setEditDatum(dag.datum);
    setEditDienst(dag.dienst);
    setEditMaaltijd(dag.maaltijd);
  }, [dag, editing]);

  // DND setup voor handle (rechts, naast edit-knop)
  const {
    setNodeRef: setDragRef,
    listeners,
    attributes,
    isDragging,
  } = useDraggable({
    id: dragId,
    disabled: dragDisabled,
  });
  const { setNodeRef: setDropRef } = useDroppable({
    id: dragId,
    disabled: dragDisabled,
  });

  function handleSave() {
    onSave({
      ...dag,
      dag: editDag,
      datum: editDatum,
      dienst: editDienst.slice(0, 3),
      maaltijd: editMaaltijd,
    });
  }

  return (
    <div
      ref={setDropRef}
      className={`
        flex items-center justify-between
        bg-gradient-to-br from-[hsl(210,100%,92%)] via-white to-[hsl(142,69%,58%)/0.10]
        rounded-xl shadow-sm border border-border/50
        px-4 py-3 gap-2
        transition-all relative
        ${isDragging ? 'ring-2 ring-primary bg-primary-light/40' : ''}
      `}
    >
      {/* Dag/datum/dienst */}
      <div className="flex items-center gap-3 min-w-0 flex-shrink-0">
        <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-light rounded-full flex items-center justify-center">
          <ChefHat className="w-5 h-5 text-white" />
        </div>
        <div className="min-w-0 flex flex-col">
          {editing ? (
            <>
              <input
                className="w-20 rounded border px-2 py-1 font-bold text-base"
                value={editDag}
                onChange={e => setEditDag(e.target.value)}
                placeholder="Dag"
              />
              <input
                className="w-16 rounded border px-2 py-0.5 text-xs mt-1"
                value={editDatum}
                maxLength={5}
                placeholder="DD-MM"
                onChange={e => setEditDatum(e.target.value)}
              />
            </>
          ) : (
            <>
              <div className="font-bold text-base text-foreground truncate">{dag.dag}</div>
              <div className="text-xs text-muted-foreground">{dag.datum}</div>
            </>
          )}
        </div>
        <div className="flex flex-col items-center ml-1">
          {editing ? (
            <input
              className="w-10 rounded border px-2 py-0.5 text-xs"
              value={editDienst}
              maxLength={3}
              placeholder="D."
              onChange={e => setEditDienst(e.target.value)}
            />
          ) : (
            <span className="inline-flex items-center rounded-full border px-2 py-0.5 font-semibold text-foreground text-xs font-mono min-w-[2ch] text-center">
              {dag.dienst || '–'}
            </span>
          )}
        </div>
      </div>
      {/* Maaltijd */}
      <div className="flex-1 min-w-0 mx-2">
        {editing ? (
          <textarea
            rows={2}
            className="w-full rounded border px-2 py-1 text-base font-medium resize-none"
            value={editMaaltijd}
            onChange={e => setEditMaaltijd(e.target.value)}
            placeholder="Maaltijd"
            maxLength={120}
            autoFocus
            style={{ lineHeight: '1.25rem' }}
          />
        ) : (
          <div className="text-base font-medium text-foreground line-clamp-2 break-words whitespace-pre-wrap min-h-[2.5em]">
            {dag.maaltijd}
          </div>
        )}
      </div>
      {/* Handle & Edit-knoppen */}
      <div className="flex items-center gap-2 ml-2">
        {/* Drag handle altijd zichtbaar, licht! */}
        {!editing && (
          <button
            type="button"
            ref={node => {
              setDragRef(node);
              setDropRef(node);
            }}
            {...listeners}
            {...attributes}
            className={`
              cursor-grab bg-gradient-primary text-muted-foreground hover:bg-gradient-secondary
            `}
            tabIndex={-1}
            title="Sleep om maaltijd te wisselen"
            aria-label="Sleep maaltijd"
          >
            <GripVertical className="w-5 h-5" />
          </button>
        )}
        {editing ? (
          <>
            <Button className="p-1 h-8 w-8" size="icon" variant="secondary" onClick={handleSave}>
              ✔
            </Button>
            <Button className="p-1 h-8 w-8" size="icon" variant="destructive" onClick={onCancel}>
              ✖
            </Button>
          </>
        ) : (
          <Button
            className="p-1 h-8 w-8"
            variant="ghost"
            size="icon"
            onClick={onEdit}
            title="Bewerken"
          >
            <SquarePen className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
