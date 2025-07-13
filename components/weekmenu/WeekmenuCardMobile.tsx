'use client';
// import { useState, useEffect } from 'react';
import { ChefHat, SquarePen, GripVertical, StickyNote, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { WeekmenuDag } from '@/types';

interface Props {
  dag: WeekmenuDag;
  editing: boolean;
  notitieEditing: boolean;
  editDatum: string;
  editDienst: string;
  editMaaltijd: string;
  editNotitie: string;
  onChangeDatum: (value: string) => void;
  onChangeDienst: (value: string) => void;
  onChangeMaaltijd: (value: string) => void;
  onChangeNotitie: (value: string) => void;
  onSave: () => void;
  onSaveNotitie: () => void;
  onCancel: () => void;
  onCancelNotitie: () => void;
  onEdit: () => void;
  onNotitieEdit: () => void;
  dragRef?: (node: HTMLElement | null) => void;
  listeners?: Record<string, unknown>;
  attributes?: React.HTMLAttributes<HTMLElement>;
}

export function WeekmenuCardMobile({
  dag,
  editing,
  notitieEditing,
  editDatum,
  editDienst,
  editMaaltijd,
  editNotitie,
  onChangeDatum,
  onChangeDienst,
  onChangeMaaltijd,
  onChangeNotitie,
  onSave,
  onSaveNotitie,
  onCancel,
  onCancelNotitie,
  onEdit,
  onNotitieEdit,
  dragRef,
  listeners,
  attributes,
}: Props) {
  return (
    <div className="bg-gradient-to-br from-[hsl(210,100%,92%)] via-white to-[hsl(142,69%,58%)/0.10] rounded-xl shadow-sm p-4 flex flex-col gap-2">
      {/* Rij 1: Chefhat, dag, datum, dienst */}
      <div className="flex items-start gap-2">
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
          <ChefHat className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <div className="text-base font-bold text-foreground">{dag.dag}</div>
          {editing ? (
            <div className="flex gap-2 mt-1">
              <input
                value={editDatum}
                onChange={e => onChangeDatum(e.target.value)}
                className="w-[4.5rem] border rounded px-2 py-0.5 text-sm"
                maxLength={5}
                placeholder="DD-MM"
              />
              <input
                value={editDienst}
                onChange={e => onChangeDienst(e.target.value)}
                className="w-[3rem] text-center border rounded px-2 py-0.5 text-sm"
                maxLength={3}
                placeholder="D."
              />
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <span>{dag.datum}</span>
              <span className="inline-block bg-tertiary-light px-2 py-0.5 rounded-full">
                {dag.dienst}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Rij 2: Maaltijd + acties */}
      <div className="flex items-start justify-between gap-2">
        {editing ? (
          <textarea
            rows={2}
            value={editMaaltijd}
            onChange={e => onChangeMaaltijd(e.target.value)}
            placeholder="Maaltijd"
            className="flex-1 border rounded px-2 py-1 text-sm resize-none"
          />
        ) : (
          <div className="flex-1 text-[1.05rem] text-foreground font-medium">{dag.maaltijd}</div>
        )}

        <div className="flex items-center gap-2 flex-shrink-0 pt-1 pl-1">
          {editing ? (
            <>
              <Button size="icon" className="bg-success text-white" onClick={onSave}>
                <Check className="w-5 h-5" />
              </Button>
              <Button size="icon" className="bg-destructive text-white" onClick={onCancel}>
                <X className="w-5 h-5" />
              </Button>
            </>
          ) : (
            <>
              <button
                ref={dragRef}
                {...listeners}
                {...attributes}
                className="text-foreground hover:text-primary"
                title="Sleep maaltijd"
              >
                <GripVertical className="w-5 h-5" />
              </button>
              <Button
                variant="ghost"
                size="icon"
                className="bg-gradient-primary text-white"
                onClick={onEdit}
                title="Bewerken"
              >
                <SquarePen className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="bg-muted"
                onClick={onNotitieEdit}
                title="Notitie"
              >
                <StickyNote className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Rij 3: Notitie invoer of weergave */}
      {notitieEditing ? (
        <div className="flex items-start gap-2">
          <textarea
            rows={2}
            value={editNotitie}
            onChange={e => onChangeNotitie(e.target.value)}
            placeholder="Notitie (optioneel)"
            className="flex-1 border rounded px-2 py-1 text-sm resize-none"
          />
          <div className="flex gap-1 pt-1">
            <Button size="icon" className="bg-success text-white" onClick={onSaveNotitie}>
              <Check className="w-5 h-5" />
            </Button>
            <Button size="icon" className="bg-destructive text-white" onClick={onCancelNotitie}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
      ) : (
        dag.notitie && (
          <div className="text-xs text-muted-foreground flex gap-1 items-start pt-1">
            <StickyNote className="w-4 h-4" />
            {dag.notitie}
          </div>
        )
      )}
    </div>
  );
}
