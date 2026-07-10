// components/preferences/PreferenceToggle.tsx

interface PreferenceToggleProps {
  label: string;
  description?: string;
  enabled: boolean;
  onToggle: () => void;
}

export default function PreferenceToggle({ label, description, enabled, onToggle }: PreferenceToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={enabled}
      className="flex w-full items-center justify-between gap-4 rounded-2xl border border-white/8 bg-white/3 px-4 py-3 text-left transition-colors hover:bg-white/6"
    >
      <div className="min-w-0">
        <p className="text-sm font-medium text-white">{label}</p>
        {description && <p className="mt-1 text-xs leading-5 text-gray-400">{description}</p>}
      </div>
      <span
        className={`relative h-7 w-12 shrink-0 rounded-full border transition-colors ${
          enabled ? 'border-pink-400/60 bg-pink-500/80' : 'border-white/10 bg-white/10'
        }`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-200 ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </span>
    </button>
  );
}
