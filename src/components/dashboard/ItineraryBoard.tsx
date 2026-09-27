"use client";

import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useMemo, useRef, useState } from "react";

import Image from "next/image";

import { IconSpark } from "@/components/ui/Icon";
import { DESTINATIONS, destinationImage } from "@/lib/content";
import { BLUR_DATA_URL } from "@/lib/images";
import { EASE_LUXE } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { ItineraryDTO, ItineraryItem, ItineraryItemKind } from "@/types";

const BACKLOG = "backlog";

const KIND_STYLE: Record<ItineraryItemKind, { dot: string; label: string }> = {
  TRANSFER: { dot: "bg-glacier", label: "Transfer" },
  STAY: { dot: "bg-champagne-deep", label: "Stay" },
  ASCENT: { dot: "bg-champagne", label: "Ascent" },
  DINING: { dot: "bg-ember", label: "Dining" },
  GUIDE: { dot: "bg-bone-dim", label: "Guide" },
  REST: { dot: "bg-mist-dim", label: "Rest" },
};

/* ---------------------------------------------------------------- *
 *  Card
 * ---------------------------------------------------------------- */

function ActivityCard({
  item,
  dragging = false,
}: {
  item: ItineraryItem;
  dragging?: boolean;
}) {
  const kind = KIND_STYLE[item.kind];

  return (
    <div
      className={cn(
        "rounded-xl border border-white/8 bg-ink-800/70 p-4 backdrop-blur-sm",
        "transition-colors duration-300",
        dragging
          ? "border-champagne/40 shadow-2xl shadow-black/60"
          : "hover:border-white/16",
      )}
    >
      <div className="mb-2.5 flex items-center gap-2">
        <span className={cn("h-1.5 w-1.5 rounded-full", kind.dot)} />
        <span className="text-[0.58rem] tracking-[0.2em] text-mist-dim uppercase">
          {kind.label}
        </span>
        <span className="ml-auto text-[0.68rem] text-mist tabular-nums">
          {item.time}
        </span>
      </div>

      <p className="text-[0.85rem] leading-snug text-bone">{item.title}</p>
      <p className="mt-1.5 text-[0.72rem] leading-relaxed text-mist-dim">
        {item.detail}
      </p>

      <p className="mt-3 border-t border-white/8 pt-2.5 text-[0.62rem] tracking-[0.14em] text-mist-dim uppercase">
        {item.duration}
      </p>
    </div>
  );
}

function SortableActivity({ item }: { item: ItineraryItem }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn("touch-none", isDragging && "opacity-35")}
      {...attributes}
      {...listeners}
    >
      <ActivityCard item={item} />
    </li>
  );
}

/* ---------------------------------------------------------------- *
 *  Column
 * ---------------------------------------------------------------- */

function Column({
  id,
  label,
  subtitle,
  items,
  tone = "day",
}: {
  id: string;
  label: string;
  subtitle: string;
  items: ItineraryItem[];
  tone?: "day" | "backlog";
}) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <section
      className={cn(
        "flex w-[19rem] shrink-0 flex-col rounded-2xl border p-4 transition-colors duration-300 lg:w-auto",
        tone === "backlog"
          ? "border-dashed border-white/12 bg-white/[0.015]"
          : "border-white/8 bg-white/[0.022]",
        isOver && "border-champagne/45 bg-champagne/[0.045]",
      )}
    >
      <header className="mb-4 px-1">
        <p className="text-[0.62rem] tracking-[0.22em] text-champagne uppercase">
          {label}
        </p>
        <p className="mt-1.5 text-[0.8rem] text-bone">{subtitle}</p>
      </header>

      <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <ul ref={setNodeRef} className="flex min-h-24 flex-1 flex-col gap-2.5">
          {items.map((item) => (
            <SortableActivity key={item.id} item={item} />
          ))}

          {items.length === 0 && (
            <li className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-white/10 py-8 text-[0.68rem] tracking-[0.14em] text-mist-dim uppercase">
              Drop here
            </li>
          )}
        </ul>
      </SortableContext>
    </section>
  );
}

/* ---------------------------------------------------------------- *
 *  Board
 * ---------------------------------------------------------------- */

export function ItineraryBoard({ initial }: { initial: ItineraryDTO }) {
  const [itinerary, setItinerary] = useState<ItineraryDTO>(initial);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [brief, setBrief] = useState("");
  const [slug, setSlug] = useState(DESTINATIONS[4].slug);
  const [days, setDays] = useState(5);
  const [generateError, setGenerateError] = useState<string | null>(null);

  const activeDestination =
    DESTINATIONS.find((d) => d.slug === slug) ?? DESTINATIONS[4];

  const saveTimer = useRef<number | null>(null);

  const sensors = useSensors(
    /* A small threshold keeps a click on a card from starting a drag. */
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const columns = useMemo(() => {
    const map = new Map<string, ItineraryItem[]>();
    itinerary.days.forEach((d) => map.set(d.id, d.items));
    map.set(BACKLOG, itinerary.backlog);
    return map;
  }, [itinerary]);

  const activeItem = useMemo(() => {
    if (!activeId) return null;
    for (const items of columns.values()) {
      const found = items.find((i) => i.id === activeId);
      if (found) return found;
    }
    return null;
  }, [activeId, columns]);

  const containerOf = useCallback(
    (itemId: string) => {
      if (columns.has(itemId)) return itemId;
      for (const [key, items] of columns.entries()) {
        if (items.some((i) => i.id === itemId)) return key;
      }
      return null;
    },
    [columns],
  );

  /** Writes a column's items back into the itinerary shape. */
  const withColumn = useCallback(
    (source: ItineraryDTO, columnId: string, items: ItineraryItem[]): ItineraryDTO =>
      columnId === BACKLOG
        ? { ...source, backlog: items }
        : {
            ...source,
            days: source.days.map((d) =>
              d.id === columnId ? { ...d, items } : d,
            ),
          },
    [],
  );

  const persist = useCallback((next: ItineraryDTO) => {
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    setSaveState("saving");

    saveTimer.current = window.setTimeout(async () => {
      try {
        await fetch("/api/itinerary", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(next),
        });
        setSaveState("saved");
        window.setTimeout(() => setSaveState("idle"), 2200);
      } catch {
        setSaveState("idle");
      }
    }, 600);
  }, []);

  const onDragStart = (event: DragStartEvent) =>
    setActiveId(String(event.active.id));

  /* Cross-column moves happen live on hover so the gap opens as you drag. */
  const onDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const from = containerOf(String(active.id));
    const to = containerOf(String(over.id));
    if (!from || !to || from === to) return;

    setItinerary((current) => {
      const fromItems = [...(current.days.find((d) => d.id === from)?.items ??
        (from === BACKLOG ? current.backlog : []))];
      const toItems = [...(current.days.find((d) => d.id === to)?.items ??
        (to === BACKLOG ? current.backlog : []))];

      const moving = fromItems.find((i) => i.id === active.id);
      if (!moving) return current;

      const overIndex = toItems.findIndex((i) => i.id === over.id);
      const insertAt = overIndex >= 0 ? overIndex : toItems.length;

      let next = withColumn(
        current,
        from,
        fromItems.filter((i) => i.id !== active.id),
      );
      next = withColumn(next, to, [
        ...toItems.slice(0, insertAt),
        moving,
        ...toItems.slice(insertAt),
      ]);

      return next;
    });
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const container = containerOf(String(active.id));
    if (!container) return;

    const items =
      container === BACKLOG
        ? itinerary.backlog
        : (itinerary.days.find((d) => d.id === container)?.items ?? []);

    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);

    const next =
      oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex
        ? withColumn(itinerary, container, arrayMove(items, oldIndex, newIndex))
        : itinerary;

    setItinerary(next);
    persist(next);
  };

  const regenerate = async () => {
    setGenerating(true);
    setGenerateError(null);
    try {
      const res = await fetch("/api/itinerary/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destinationSlug: slug,
          days,
          brief: brief.trim() || undefined,
        }),
      });
      const data = (await res.json()) as {
        itinerary?: ItineraryDTO;
        error?: string;
      };
      if (res.ok && data.itinerary) {
        setItinerary(data.itinerary);
        persist(data.itinerary);
      } else {
        setGenerateError(data.error ?? "Could not rebuild the plan.");
      }
    } catch {
      setGenerateError("Network error. Try again.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Brief */}
      <div className="glass glass-sheen overflow-hidden rounded-2xl">
        <div className="relative h-36 sm:h-44">
          <Image
            src={destinationImage(activeDestination.slug, 1800)}
            alt={activeDestination.name}
            fill
            quality={80}
            sizes="100vw"
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/40 to-ink-900/20" />
          <p className="eyebrow absolute bottom-4 left-6 text-[0.58rem] text-bone/85">
            {activeDestination.region} · {activeDestination.country}
          </p>
        </div>

        <div className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="min-w-0 flex-1">
            <p className="eyebrow text-[0.6rem]">Itinerary studio</p>
            <h2 className="font-display mt-3 text-2xl leading-tight tracking-[-0.02em] text-bone sm:text-3xl">
              {itinerary.title}
            </h2>
            <p className="mt-3 max-w-2xl text-[0.82rem] leading-relaxed text-mist">
              {itinerary.summary}
            </p>
          </div>

          <span
            className={cn(
              "shrink-0 text-[0.62rem] tracking-[0.18em] uppercase transition-colors duration-500",
              saveState === "saving" && "text-mist",
              saveState === "saved" && "text-champagne",
              saveState === "idle" && "text-transparent",
            )}
          >
            {saveState === "saving" ? "Saving…" : "Saved"}
          </span>
        </div>

        <div className="mt-8 grid gap-4 border-t border-white/8 pt-6 lg:grid-cols-[1fr_auto_auto_auto] lg:items-end">
          <label className="block">
            <span className="eyebrow text-[0.56rem]">Steer the plan</span>
            <input
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              maxLength={280}
              placeholder="More rest days, less driving, one big summit push…"
              className="mt-2.5 w-full border-b border-white/15 bg-transparent pb-2.5 text-[0.85rem] text-bone outline-none transition-colors duration-300 placeholder:text-mist-dim/70 focus:border-champagne"
            />
          </label>

          <label className="block">
            <span className="eyebrow text-[0.56rem]">Destination</span>
            <select
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="mt-2.5 w-full border-b border-white/15 bg-transparent pb-2.5 text-[0.85rem] text-bone outline-none focus:border-champagne lg:w-44"
            >
              {DESTINATIONS.map((d) => (
                <option key={d.slug} value={d.slug} className="bg-ink-800">
                  {d.name}, {d.country}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="eyebrow text-[0.56rem]">Days · {days}</span>
            <input
              type="range"
              min={2}
              max={9}
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="mt-4 w-full accent-[var(--color-champagne)] lg:w-32"
            />
          </label>

          <button
            type="button"
            onClick={regenerate}
            disabled={generating}
            className={cn(
              "flex items-center justify-center gap-2.5 rounded-full px-6 py-3.5",
              "text-[0.68rem] font-medium tracking-[0.2em] uppercase",
              "bg-bone text-ink-950 transition-all duration-500 hover:bg-white",
              "disabled:cursor-wait disabled:opacity-60",
            )}
          >
            <IconSpark
              className={cn("h-3.5 w-3.5", generating && "animate-spin")}
            />
            {generating ? "Planning…" : "Rebuild with AI"}
          </button>
        </div>

        {generateError && (
          <p className="mt-4 border-l border-ember pl-3 text-sm text-ember">
            {generateError}
          </p>
        )}
        </div>
      </div>

      {/* Board */}
      <AnimatePresence mode="wait">
        <motion.div
          key={itinerary.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE_LUXE }}
        >
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDragEnd={onDragEnd}
            onDragCancel={() => setActiveId(null)}
          >
            <div className="hide-scrollbar -mx-5 flex gap-4 overflow-x-auto px-5 pb-2 lg:mx-0 lg:grid lg:grid-cols-2 lg:overflow-visible lg:px-0 xl:grid-cols-3">
              {itinerary.days.map((day) => (
                <Column
                  key={day.id}
                  id={day.id}
                  label={day.label}
                  subtitle={day.subtitle}
                  items={day.items}
                />
              ))}

              <Column
                id={BACKLOG}
                label="Unscheduled"
                subtitle="Suggested, not yet placed"
                items={itinerary.backlog}
                tone="backlog"
              />
            </div>

            <DragOverlay dropAnimation={{ duration: 260, easing: "cubic-bezier(0.16,1,0.3,1)" }}>
              {activeItem ? (
                <div className="w-[17rem] rotate-[1.2deg] cursor-grabbing">
                  <ActivityCard item={activeItem} dragging />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </motion.div>
      </AnimatePresence>

      <p className="text-[0.7rem] leading-relaxed text-mist-dim">
        Drag any card between days, or pull one down from Unscheduled. Changes
        save automatically.
      </p>
    </div>
  );
}
