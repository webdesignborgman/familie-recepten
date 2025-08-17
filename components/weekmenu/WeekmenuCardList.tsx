// ✅ WeekmenuCardList.tsx
'use client';
import { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  type DragEndEvent,
  useSensor,
  useSensors,
  PointerSensor,
  TouchSensor,
} from '@dnd-kit/core';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { WeekmenuCard } from './WeekmenuCard';
import { WeekmenuCardMobileSortable } from './WeekmenuCardMobileSortable';
import { updateWeekmenuDagen } from '@/lib/weekmenu-api';
import type { WeekmenuDag } from '@/types';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

interface Props {
  weekmenuId: string;
  dagen: WeekmenuDag[];
}

export function WeekmenuCardList({ weekmenuId, dagen }: Props) {
  const [items, setItems] = useState<WeekmenuDag[]>(dagen);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDatum, setEditDatum] = useState('');
  const [editDienst, setEditDienst] = useState('');
  const [editMaaltijd, setEditMaaltijd] = useState('');
  const [editNotitie, setEditNotitie] = useState('');

  const isMobile = useMediaQuery('(max-width: 640px)');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 8,
      },
    })
  );

  useEffect(() => {
    if (editingId) {
      const dag = items.find(d => d.id === editingId);
      if (dag) {
        setEditDatum(dag.datum);
        setEditDienst(dag.dienst);
        setEditMaaltijd(dag.maaltijd);
      }
    }
  }, [editingId, items]);

  // Wanneer je een dag gaat editen, laad ook de notitie
  useEffect(() => {
    if (editingId) {
      const dag = items.find(d => d.id === editingId);
      if (dag) setEditNotitie(dag.notitie || '');
    }
  }, [editingId, items]);

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

  function handleSaveDag() {
    if (!editingId) return;
    const newItems = items.map(d =>
      d.id === editingId
        ? {
            ...d,
            datum: editDatum,
            dienst: editDienst.slice(0, 3),
            maaltijd: editMaaltijd,
            notitie: editNotitie.trim(),
          }
        : d
    );
    setItems(newItems);
    updateWeekmenuDagen(weekmenuId, newItems);
    setEditingId(null);
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      {isMobile ? (
        <SortableContext items={items.map(d => d.id)} strategy={verticalListSortingStrategy}>
          <ul className="flex flex-col gap-4">
            {items.map(dag => (
              <li key={dag.id}>
                <WeekmenuCardMobileSortable
                  dag={dag}
                  editing={editingId === dag.id}
                  notitieEditing={false}
                  editDatum={editDatum}
                  editDienst={editDienst}
                  editMaaltijd={editMaaltijd}
                  editNotitie={editNotitie}
                  onChangeDatum={setEditDatum}
                  onChangeDienst={setEditDienst}
                  onChangeMaaltijd={setEditMaaltijd}
                  onChangeNotitie={setEditNotitie}
                  onSave={handleSaveDag}
                  onCancel={() => setEditingId(null)}
                  onSaveNotitie={() => {}}
                  onCancelNotitie={() => {}}
                  onEdit={() => setEditingId(dag.id)}
                  onNotitieEdit={() => setEditingId(dag.id)}
                />
              </li>
            ))}
          </ul>
        </SortableContext>
      ) : (
        <SortableContext items={items.map(d => d.id)} strategy={verticalListSortingStrategy}>
          <ul className="flex flex-col gap-4">
            {items.map(dag => (
              <li key={dag.id}>
                <WeekmenuCard
                  dag={dag}
                  editing={editingId === dag.id}
                  onEdit={() => setEditingId(dag.id)}
                  onCancel={() => setEditingId(null)}
                  onSave={updated => {
                    const newItems = items.map(d => (d.id === updated.id ? updated : d));
                    setItems(newItems);
                    updateWeekmenuDagen(weekmenuId, newItems);
                    setEditingId(null);
                  }}
                  dragId={dag.id}
                  dragDisabled={editingId !== null}
                />
              </li>
            ))}
          </ul>
        </SortableContext>
      )}
    </DndContext>
  );
}
