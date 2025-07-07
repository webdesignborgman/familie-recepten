'use client';

import Link from 'next/link';
import { ChefHat, Heart, Mail, MapPin, BookOpen, CalendarDays, ShoppingCart } from 'lucide-react';

const currentYear = new Date().getFullYear();

const productLinks = [
  {
    label: 'Recepten',
    href: '/recepten',
    icon: <BookOpen className="w-4 h-4 mr-2 text-primary" />,
  },
  {
    label: 'Weekmenu',
    href: '/weekmenu',
    icon: <CalendarDays className="w-4 h-4 mr-2 text-primary" />,
  },
  {
    label: 'Boodschappenlijst',
    href: '/boodschappenlijst',
    icon: <ShoppingCart className="w-4 h-4 mr-2 text-primary" />,
  },
];

export function Footer() {
  return (
    <footer className="bg-gradient-subtle border-t border-border">
      <div className="container mx-auto px-4 py-16">
        <div
          className="
          hidden lg:flex
          flex-row
          justify-between
          items-start
          gap-8
          mb-12
        "
        >
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
                <ChefHat className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">Familie Recepten</span>
            </div>
            <p className="text-muted-foreground mb-6 leading-relaxed max-w-xs">
              Breng je familie samen rond de keukentafel. Organiseer recepten, plan maaltijden en
              maak boodschappen doen een fluitje van een cent.
            </p>
            <div className="flex items-center text-sm text-muted-foreground">
              <Heart className="w-4 h-4 mr-1 text-red-500" />
              Gemaakt met liefde
            </div>
          </div>
          {/* Product links met iconen */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Product</h3>
            <ul className="space-y-3">
              {productLinks.map(link => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="flex items-center text-muted-foreground hover:text-primary transition-colors duration-300"
                  >
                    {link.icon}
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          {/* Contact info */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-center text-muted-foreground">
                <Mail className="w-4 h-4 mr-3" />
                <span className="text-sm">recept@webdesignborgman.nl</span>
              </div>
              <div className="flex items-center text-muted-foreground">
                <MapPin className="w-4 h-4 mr-3" />
                <span className="text-sm">Nederland</span>
              </div>
            </div>
          </div>
        </div>
        {/* Responsive grid op mobiel/tablet */}
        <div className="lg:hidden grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
                <ChefHat className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">Familie Recepten</span>
            </div>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Breng je familie samen rond de keukentafel. Organiseer recepten, plan maaltijden en
              maak boodschappen doen een fluitje van een cent.
            </p>
            <div className="flex items-center text-sm text-muted-foreground">
              <Heart className="w-4 h-4 mr-1 text-red-500" />
              Gemaakt met liefde
            </div>
          </div>
          {/* Product links met iconen */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Product</h3>
            <ul className="space-y-3">
              {productLinks.map(link => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="flex items-center text-muted-foreground hover:text-primary transition-colors duration-300"
                  >
                    {link.icon}
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          {/* Contact info */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-center text-muted-foreground">
                <Mail className="w-4 h-4 mr-3" />
                <span className="text-sm">recept@webdesignborgman.nl</span>
              </div>
              <div className="flex items-center text-muted-foreground">
                <MapPin className="w-4 h-4 mr-3" />
                <span className="text-sm">Nederland</span>
              </div>
            </div>
          </div>
        </div>
        {/* Bottom section */}
        <div className="pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <p className="text-muted-foreground text-sm">
              © {currentYear} Familie Recepten door Webdesign Borgman. Alle rechten voorbehouden.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
