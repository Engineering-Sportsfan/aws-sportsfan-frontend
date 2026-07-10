// components/preferences/PreferenceCard.tsx

import { ReactNode } from 'react';

interface PreferenceCardProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  className?: string;
  children: ReactNode;
}

export default function PreferenceCard({ title, description, icon, className = '', children }: PreferenceCardProps) {
  return (
    <section className={`rounded-[28px] border border-white/10 bg-[#111111]/95 p-4 sm:p-5 shadow-[0_18px_60px_rgba(0,0,0,0.35)] ${className}`}>
      <div className="mb-4 flex items-start gap-3">
        {icon && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-pink-400">
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          {description && <p className="mt-1 text-sm text-gray-400">{description}</p>}
        </div>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
