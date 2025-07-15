import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export function ShoppingListToolbar({
  onClearAll,
  onClearChecked,
}: {
  onClearAll: () => void;
  onClearChecked: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex justify-end mb-2">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button
            type="button"
            className="uppercase text-destructive text-sm tracking-wider font-semibold px-1 py-0 bg-transparent border-none hover:underline focus:underline focus:outline-none transition"
            onClick={() => setOpen(true)}
            title="Boodschappenlijst wissen"
          >
            wissen
          </button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>Boodschappenlijst wissen</DialogTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Wat wil je wissen? Deze actie kan niet ongedaan worden gemaakt.
          </p>
          <DialogFooter className="flex flex-col items-stretch gap-2 mt-4">
            <Button
              variant="destructive"
              onClick={() => {
                onClearAll();
                setOpen(false);
              }}
            >
              Alles wissen
            </Button>
            <Button
              className="bg-gradient-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => {
                onClearChecked();
                setOpen(false);
              }}
            >
              Afgevinkte boodschappen wissen
            </Button>
            <Button className="bg-tertiary text-backround" onClick={() => setOpen(false)}>
              Annuleren
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
