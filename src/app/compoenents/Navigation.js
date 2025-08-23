'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { href: '/information', label: 'Info' },
    { href: '/', label: 'Resources' },
    { href: '/ai-agent', label: 'AI Agent' },
  ];

  return (
    <nav className="flex items-center space-x-6">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`relative text-sm font-medium transition-colors duration-200 ${
              isActive
                ? 'text-blue-600'
                : 'text-gray-700 hover:text-gray-900'
            }`}
          >
            {item.label}
            {isActive && (
              <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-blue-600 rounded-full"></span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}