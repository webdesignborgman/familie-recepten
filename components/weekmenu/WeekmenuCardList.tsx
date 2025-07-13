'use client';
import { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  type DragEndEvent,
  useDraggable,
  useDroppable,
} from '@dnd-kit/core';
import { ChefHat, SquarePen, GripVertical, StickyNote, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { updateWeekmenuDagen } from '@/lib/weekmenu-api';
import type { WeekmenuDag } from '@/types';

interface Props {
  weekmenuId: string;
  dagen: WeekmenuDag[];
}

export function WeekmenuCardList({ weekmenuId, dagen }: Props) {
  const [items, setItems] = useState<WeekmenuDag[]>(dagen);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [notitieEditingId, setNotitieEditingId] = useState<string | null>(null);

  function handleDragEnd(event: DragEndEvent) {
    const fromId = event.active.id as string;
    const toId = event.over?.id as string | undefined;
    if (!toId || fromId === toId) return;
    const fromIdx = items.findIndex(d => d.id === fromId);
    const toIdx = items.findIndex(d => d.id === toId);
    if (fromIdx === -1 || toIdx === -1) return;
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

  function handleSaveNotitie(updated: WeekmenuDag) {
    const newItems = items.map(d => (d.id === updated.id ? updated : d));
    setItems(newItems);
    updateWeekmenuDagen(weekmenuId, newItems);
    setNotitieEditingId(null);
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
              dragDisabled={editingId !== null || notitieEditingId !== null}
              notitieEditing={notitieEditingId === dag.id}
              onNotitieEdit={() => setNotitieEditingId(dag.id)}
              onNotitieCancel={() => setNotitieEditingId(null)}
              onSaveNotitie={handleSaveNotitie}
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
  notitieEditing: boolean;
  onNotitieEdit: () => void;
  onNotitieCancel: () => void;
  onSaveNotitie: (dag: WeekmenuDag) => void;
}

function WeekmenuCard({
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

  // notitie los in state (voor editmodus notitie)
  const [editNotitie, setEditNotitie] = useState(dag.notitie ?? '');

  useEffect(() => {
    setEditDatum(dag.datum);
    setEditDienst(dag.dienst);
    setEditMaaltijd(dag.maaltijd);
  }, [dag, editing]);

  useEffect(() => {
    setEditNotitie(dag.notitie ?? '');
  }, [dag, notitieEditing]);

  // DND setup voor handle
  const {
    setNodeRef: setDragRef,
    listeners,
    attributes,
    isDragging,
  } = useDraggable({
    id: dragId,
    disabled: dragDisabled || editing || notitieEditing,
  });
  const { setNodeRef: setDropRef } = useDroppable({
    id: dragId,
    disabled: dragDisabled || editing || notitieEditing,
  });

  function handleSave() {
    onSave({
      ...dag,
      datum: editDatum,
      dienst: editDienst.slice(0, 3),
      maaltijd: editMaaltijd,
      // notitie: unchanged
    });
  }

  function handleSaveNotitie() {
    onSaveNotitie({
      ...dag,
      notitie: editNotitie,
    });
  }

  return (
    <div
      ref={setDropRef}
      className={`
        bg-gradient-to-br from-[hsl(210,100%,92%)] via-white to-[hsl(142,69%,58%)/0.10]
        rounded-xl shadow-sm border border-border/50
        px-4 py-3 transition-all relative min-h-[70px]
        ${isDragging ? 'ring-2 ring-primary bg-primary-light/40' : ''}
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
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, hsl(142,76%,36%), hsl(142,69%,58%))',
          }}
        >
          <ChefHat className="w-5 h-5 text-white" />
        </div>
      </div>

      {/* Dag en datum gestapeld */}
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

      {/* Dienst badge/input rechts naast dag/datum */}
      <div
        className={
          editing || notitieEditing
            ? 'flex items-center justify-center'
            : 'row-span-2 flex items-center justify-center'
        }
      >
        {editing ? (
          <input
            className="w-14 text-lg text-center font-bold rounded-full border-2 px-2 py-2"
            value={editDienst}
            maxLength={3}
            placeholder="D."
            onChange={e => setEditDienst(e.target.value)}
            style={{
              background: 'hsl(210,100%,56%)',
              borderColor: 'hsl(210,100%,56%)',
              color: 'white',
            }}
          />
        ) : (
          <span
            className="inline-flex items-center justify-center rounded-full border-2 font-bold text-lg font-mono min-w-[2ch] text-center"
            style={{
              minHeight: 36,
              background: 'hsl(210,100%,92%)',
              borderColor: 'hsl(210,100%,92%)',
              color: 'hsl(222, 84%, 4.9%)',
              padding: '0.3em 1.2em',
            }}
          >
            {dag.dienst || '–'}
          </span>
        )}
      </div>

      {editing ? (
        <>
          {/* Maaltijd */}
          <textarea
            rows={1}
            className="w-full rounded border px-2 py-1 text-base font-medium resize-none"
            value={editMaaltijd}
            onChange={e => setEditMaaltijd(e.target.value)}
            placeholder="Maaltijd"
            maxLength={120}
            autoFocus
          />
          {/* Actieknoppenblok */}
          <div className="flex items-center gap-1 ml-2">
            {/* Handle */}
            <button
              type="button"
              ref={node => {
                setDragRef(node);
                setDropRef(node);
              }}
              {...listeners}
              {...attributes}
              className="
                cursor-grab
                text-foreground
                w-auto h-auto
                p-0
                bg-transparent
                border-none
                shadow-none
                focus:outline-none
                hover:text-primary
              "
              tabIndex={-1}
              title="Sleep om maaltijd te wisselen"
              aria-label="Sleep maaltijd"
              disabled
            >
              <GripVertical className="w-5 h-5" />
            </button>
            <Button
              className="p-1 h-8 w-8 bg-green-600 hover:bg-green-700 text-white"
              size="icon"
              variant="secondary"
              onClick={handleSave}
              type="button"
            >
              <span className="sr-only">Opslaan</span>
              <Check className="w-5 h-5 transition-all" />
            </Button>
            <Button
              className="p-1 h-8 w-8 bg-red-600 hover:bg-red-700 text-white"
              size="icon"
              variant="secondary"
              onClick={onCancel}
              type="button"
            >
              <span className="sr-only">Annuleer</span>
              <X className="w-6 h-6 transition-transform" />
            </Button>
            {/* Notitie knop */}
            <Button
              className="p-1 h-8 w-8 bg-muted"
              variant="ghost"
              size="icon"
              title="Notitie"
              type="button"
              onClick={onNotitieEdit}
            >
              <StickyNote className="w-5 h-5" />
            </Button>
          </div>
        </>
      ) : notitieEditing ? (
        <>
          {/* Alleen een veldje voor de notitie */}
          <textarea
            rows={1}
            className="w-full rounded border px-2 py-1 text-sm mt-1"
            value={editNotitie}
            onChange={e => setEditNotitie(e.target.value)}
            placeholder="Notitie (optioneel)"
            maxLength={140}
            autoFocus
          />
          {/* Actieknoppenblok voor notitie */}
          <div className="flex items-center gap-1 ml-2">
            <Button
              className="p-1 h-8 w-8 bg-green-600 hover:bg-green-700 text-white"
              size="icon"
              variant="secondary"
              onClick={handleSaveNotitie}
              type="button"
            >
              <span className="sr-only">Opslaan notitie</span>
              <Check className="w-5 h-5 transition-all" />
            </Button>
            <Button
              className="p-1 h-8 w-8 bg-red-600 hover:bg-red-700 text-white"
              size="icon"
              variant="secondary"
              onClick={onNotitieCancel}
              type="button"
            >
              <span className="sr-only">Annuleer notitie</span>
              <X className="w-6 h-6 transition-transform" />
            </Button>
          </div>
        </>
      ) : (
        <>
          {/* Maaltijd */}
          <div className="row-span-2 flex items-center min-w-0">
            <div className="text-base font-medium text-foreground line-clamp-2 break-words whitespace-pre-wrap min-h-[2.7em]">
              {dag.maaltijd}
            </div>
          </div>
          {/* Handle */}
          <div className="row-span-2 flex items-center justify-center">
            <button
              type="button"
              ref={node => {
                setDragRef(node);
                setDropRef(node);
              }}
              {...listeners}
              {...attributes}
              className="
                cursor-grab
                text-foreground
                w-auto h-auto
                p-0
                bg-transparent
                border-none
                shadow-none
                focus:outline-none
                hover:text-primary
              "
              tabIndex={-1}
              title="Sleep om maaltijd te wisselen"
              aria-label="Sleep maaltijd"
            >
              <GripVertical className="w-5 h-5" />
            </button>
          </div>
          {/* Edit */}
          <div className="row-span-2 flex items-center justify-center">
            <Button
              className="p-1 h-8 w-8 bg-gradient-primary text-white"
              variant="ghost"
              size="icon"
              onClick={onEdit}
              title="Bewerken"
              type="button"
            >
              <SquarePen className="w-4 h-4" />
            </Button>
          </div>
          {/* Notitie-icoon */}
          <div className="row-span-2 flex items-center justify-center">
            <Button
              className="p-1 h-8 w-8 bg-muted"
              variant="ghost"
              size="icon"
              title="Notitie"
              type="button"
              onClick={onNotitieEdit}
            >
              <StickyNote className="w-5 h-5" />
            </Button>
          </div>
        </>
      )}

      {/* Notitie alleen tonen als deze er is en niet in edit-modus */}
      {!editing && !notitieEditing && dag.notitie && dag.notitie.trim().length > 0 && (
        <div className="col-span-full mt-2 text-xs text-muted-foreground flex items-center gap-2">
          <StickyNote className="w-4 h-4" />
          <span className="whitespace-pre-wrap">{dag.notitie}</span>
        </div>
      )}
    </div>
  );
}
