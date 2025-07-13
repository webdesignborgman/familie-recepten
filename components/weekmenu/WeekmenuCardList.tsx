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
import { WeekmenuCardMobile } from './WeekmenuCardMobile';
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
  const [editDatum, setEditDatum] = useState('');
  const [editDienst, setEditDienst] = useState('');
  const [editMaaltijd, setEditMaaltijd] = useState('');
  const [editNotitie, setEditNotitie] = useState('');

  const isMobile = useMediaQuery('(max-width: 640px)');

  // ✅ Sensors configureren voor desktop én mobiel ondersteuning
  const sensors = useSensors(useSensor(PointerSensor), useSensor(TouchSensor));

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

  useEffect(() => {
    if (notitieEditingId) {
      const dag = items.find(d => d.id === notitieEditingId);
      if (dag) {
        setEditNotitie(dag.notitie || '');
      }
    }
  }, [notitieEditingId, items]);

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
          }
        : d
    );
    setItems(newItems);
    updateWeekmenuDagen(weekmenuId, newItems);
    setEditingId(null);
  }

  function handleSaveNotitie() {
    if (!notitieEditingId) return;
    const newItems = items.map(d =>
      d.id === notitieEditingId ? { ...d, notitie: editNotitie } : d
    );
    setItems(newItems);
    updateWeekmenuDagen(weekmenuId, newItems);
    setNotitieEditingId(null);
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      {isMobile ? (
        <ul className="flex flex-col gap-4">
          {items.map(dag => (
            <li key={dag.id}>
              <WeekmenuCardMobile
                dag={dag}
                editing={editingId === dag.id}
                notitieEditing={notitieEditingId === dag.id}
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
                onSaveNotitie={handleSaveNotitie}
                onCancelNotitie={() => setNotitieEditingId(null)}
                onEdit={() => setEditingId(dag.id)}
                onNotitieEdit={() => setNotitieEditingId(dag.id)}
              />
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col gap-4">
          {items.map(dag => (
            <WeekmenuCard
              key={dag.id}
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
              dragDisabled={editingId !== null || notitieEditingId !== null}
              notitieEditing={notitieEditingId === dag.id}
              onNotitieEdit={() => setNotitieEditingId(dag.id)}
              onNotitieCancel={() => setNotitieEditingId(null)}
              onSaveNotitie={updated => {
                const newItems = items.map(d => (d.id === updated.id ? updated : d));
                setItems(newItems);
                updateWeekmenuDagen(weekmenuId, newItems);
                setNotitieEditingId(null);
              }}
            />
          ))}
        </div>
      )}
    </DndContext>
  );
}
