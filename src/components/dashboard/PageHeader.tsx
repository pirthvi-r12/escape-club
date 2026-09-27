import { Reveal } from "@/components/ui/Reveal";

export function PageHeader({
  eyebrow,
  title,
  description,
  aside,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  aside?: React.ReactNode;
}) {
  return (
    <Reveal y={18} className="mb-8">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow text-[0.6rem]">{eyebrow}</p>
          <h1 className="font-display mt-4 text-[length:var(--text-title)] leading-[1.05] tracking-[-0.03em] text-bone">
            {title}
          </h1>
          {description && (
            <p className="mt-3 max-w-xl text-[0.85rem] leading-relaxed text-mist">
              {description}
            </p>
          )}
        </div>
        {aside}
      </div>
    </Reveal>
  );
}
