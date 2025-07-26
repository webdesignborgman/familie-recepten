'use client';
import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { Skeleton } from '../../components/ui/skeleton';
import MaaltijdplannerCard from '../../components/maaltijdplanner/MaaltijdplannerCard';
import { useMaaltijdplanner } from '../../hooks/useMaaltijdplanner';

const dayNames = [
  'Zaterdag',
  'Zondag',
  'Maandag',
  'Dinsdag',
  'Woensdag',
  'Donderdag',
  'Vrijdag',
  'Zaterdag',
  'Zondag',
];

export default function MaaltijdplannerPage() {
  const { planner, loading, updateDay, updateCategory, clearCategory } = useMaaltijdplanner();
  const [activeTab, setActiveTab] = React.useState('0');

  return (
    <div className="max-w-4xl mx-auto py-8 px-2">
      <h1 className="text-3xl font-bold mb-6 text-primary">Maaltijdplanner</h1>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap gap-2 mb-4">
          {dayNames.map((name, i) => {
            const datum = planner?.[i]?.datum || '';
            return (
              <TabsTrigger
                key={i}
                value={String(i)}
                className={`flex-1 min-w-[90px] px-2 py-2 rounded-xl transition-colors flex flex-col items-center justify-center ${
                  activeTab === String(i)
                    ? 'bg-secondary-vibrant text-white'
                    : 'bg-secondary text-foreground'
                }`}
              >
                <span className="text-base font-semibold leading-tight">{name}</span>
                <span className="text-xs font-mono text-muted-foreground mt-1 text-center w-full">
                  {datum}
                </span>
              </TabsTrigger>
            );
          })}
        </TabsList>
        {dayNames.map((name, i) => (
          <TabsContent key={i} value={String(i)}>
            {loading || !planner ? (
              <Skeleton className="h-[420px] w-full rounded-xl" />
            ) : (
              <MaaltijdplannerCard
                dayIndex={i}
                day={planner[i]}
                updateDay={updateDay}
                updateCategory={updateCategory}
                clearCategory={clearCategory}
              />
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
