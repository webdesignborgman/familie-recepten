'use client';

import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Users, Heart as HeartIcon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface RecipeCardProps {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  cookingTime: string;
  servings: number;
  image?: string;
  isPrivate?: boolean;
  isFavorited?: boolean;
  onClick?: () => void;
  onToggleFavorite?: (id: string, newState: boolean) => Promise<void>;
}

export default function RecipeCard({
  id,
  title,
  subtitle,
  category,
  cookingTime,
  servings,
  image,
  isPrivate = false,
  isFavorited = false,
  onClick,
  onToggleFavorite,
}: RecipeCardProps) {
  const [favorited, setFavorited] = useState(isFavorited);
  const [isLoading, setIsLoading] = useState(false);

  const handleFavorite = async () => {
    if (!onToggleFavorite) return;
    const next = !favorited;
    setFavorited(next);
    setIsLoading(true);
    try {
      await onToggleFavorite(id, next);
      toast.success(next ? 'Toegevoegd aan favorieten!' : 'Verwijderd uit favorieten!');
    } catch {
      setFavorited(!next);
      toast.error('Kon voorkeur niet opslaan.');
    }
    setIsLoading(false);
  };

  return (
    <div className="group bg-gradient-card rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-200 border border-border/40 flex flex-col">
      {/* Image section */}
      <div className="relative h-44 bg-muted">
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500"
            placeholder="blur"
            blurDataURL="data:image/svg+xml;base64,PHN2ZyBmaWxsPSIjZmZmIiB2aWV3Qm94PSIwIDAgMjAwIDIwMCIgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiLz4="
            quality={80}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl text-primary/20">
            🍽️
          </div>
        )}

        {/* Favorite overlay on image */}
        {onToggleFavorite && (
          <button
            type="button"
            onClick={handleFavorite}
            disabled={isLoading}
            className={`absolute bottom-2 right-2 p-2 rounded-full transition-colors ${
              favorited ? 'bg-red-100 hover:bg-red-200' : 'bg-white hover:bg-gray-100'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${
              isLoading ? 'opacity-50 cursor-wait' : ''
            }`}
          >
            <HeartIcon
              fill={favorited ? 'currentColor' : 'none'}
              strokeWidth={2}
              className={`w-5 h-5 transition-transform ${
                favorited ? 'text-red-500 scale-110' : 'text-gray-400'
              }`}
            />
          </button>
        )}

        {/* Privacy/Public badge */}
        <div className="absolute top-3 left-3">
          <Badge
            variant={isPrivate ? 'destructive' : 'secondary'}
            className="text-xs font-medium shadow"
          >
            {isPrivate ? 'Privé' : 'Publiek'}
          </Badge>
        </div>
        {/* Category badge */}
        <div className="absolute top-3 right-3">
          <Badge variant="outline" className="bg-white/90 backdrop-blur-sm text-xs">
            {category}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white/90 flex-1 flex flex-col p-5 rounded-b-2xl">
        <div className="mb-2">
          <h3 className="text-lg font-semibold text-foreground mb-1 line-clamp-1">{title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">{subtitle}</p>
        </div>
        <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-5">
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {cookingTime}
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {servings} pers.
          </span>
        </div>
        <Button
          size="sm"
          className="bg-gradient-primary hover:opacity-90 mt-auto"
          onClick={onClick}
        >
          Bekijk Recept
        </Button>
      </div>
    </div>
  );
}
