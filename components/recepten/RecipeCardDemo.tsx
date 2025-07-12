'use client';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Clock, Users } from 'lucide-react';

type RecipeCardDemoProps = {
  title: string;
  subtitle: string;
  category: string;
  cookingTime: string;
  servings: number;
  image?: string;
  isPrivate?: boolean;
};

export default function RecipeCardDemo({
  title,
  subtitle,
  category,
  cookingTime,
  servings,
  image,
  isPrivate = false,
}: RecipeCardDemoProps) {
  return (
    <div className="group bg-gradient-card rounded-2xl overflow-hidden shadow-xl border border-border/40 flex flex-col">
      <div className="relative h-44 bg-muted">
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl text-primary/20">
            🍽️
          </div>
        )}
        <div className="absolute top-3 left-3">
          <Badge
            variant={isPrivate ? 'destructive' : 'secondary'}
            className="text-xs font-medium shadow"
          >
            {isPrivate ? 'Privé' : 'Publiek'}
          </Badge>
        </div>
        <div className="absolute top-3 right-3">
          <Badge variant="outline" className="bg-white/90 backdrop-blur-sm text-xs">
            {category}
          </Badge>
        </div>
      </div>
      <div className="bg-white/90 flex-1 flex flex-col p-5 rounded-b-2xl">
        <div className="mb-2">
          <h3 className="text-lg font-semibold text-foreground mb-1 line-clamp-1">{title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">{subtitle}</p>
        </div>
        <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-4">
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {cookingTime}
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {servings} pers.
          </span>
        </div>
        <div className="text-center text-xs text-muted-foreground italic mt-auto">
          Maak een gratis account aan om je eigen recepten te bekijken!
        </div>
      </div>
    </div>
  );
}
// This component is a demo for a recipe card, showcasing the use of badges, images, and text formatting.
// It includes properties for title, subtitle, category, cooking time, servings, and an optional image.
// The card is styled with a gradient background, rounded corners, and shadow effects.
