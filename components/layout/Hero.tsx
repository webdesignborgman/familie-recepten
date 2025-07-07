'use client';

import { ChefHat, Users, Heart, Clock } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const features = [
  {
    icon: <ChefHat className="w-6 h-6 text-white" />,
    title: 'Familie Recepten',
    desc: 'Bewaar en deel je favoriete gerechten',
  },
  {
    icon: <Users className="w-6 h-6 text-white" />,
    title: 'Samen Plannen',
    desc: "Deel weekmenu's met je gezin",
  },
  {
    icon: <Heart className="w-6 h-6 text-white" />,
    title: 'Persoonlijk',
    desc: 'Privé of openbaar, jij bepaalt',
  },
  {
    icon: <Clock className="w-6 h-6 text-white" />,
    title: 'Slim Organiseren',
    desc: 'Van boodschappenlijst tot weekmenu',
  },
];

export function Hero() {
  return (
    <section className="relative flex flex-col justify-center min-h-[70vh] py-12 bg-gradient-hero">
      <div className="text-center max-w-4xl mx-auto">
        {/* Titel + animatie */}
        <div className="animate-slide-up">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Jouw Familie
            <span className="block bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
              Keuken Centrum
            </span>
          </h1>
        </div>
        {/* Subtitel */}
        <div className="animate-slide-up" style={{ animationDelay: '0.2s' } as React.CSSProperties}>
          <p className="text-xl md:text-2xl text-white/90 mb-12 leading-relaxed">
            Organiseer recepten, plan weekmenu&apos;s en maak boodschappenlijsten.
            <br className="hidden md:block" />
            Alles op één plek, samen met je familie.
          </p>
        </div>
        {/* CTA Buttons */}
        <div
          className="animate-slide-up flex flex-col sm:flex-row gap-4 justify-center mb-20"
          style={{ animationDelay: '0.4s' } as React.CSSProperties}
        >
          <Button
            asChild
            className="text-lg px-8 py-4 bg-white text-primary hover:bg-white/90 shadow-xl"
          >
            <Link href="/register">Begin Nu Gratis</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="text-lg px-8 py-4 text-white border-white/30 hover:bg-white/10"
          >
            <Link href="/login">Login</Link>
          </Button>
        </div>
        {/* Feature Cards */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 animate-fade-in"
          style={{ animationDelay: '0.6s' } as React.CSSProperties}
        >
          {features.map((feature, i) => (
            <div
              key={i}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105"
              style={{ animationDelay: `${0.8 + i * 0.1}s` } as React.CSSProperties}
            >
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4 mx-auto">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-white/80 text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
      {/* Extra sfeer overlay met lichte mist, Lovable style */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-gradient-subtle opacity-50" />
    </section>
  );
}

export default Hero;
