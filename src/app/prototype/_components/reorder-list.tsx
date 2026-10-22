"use client";
"use no memo";

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToParentElement, restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

import { Badge } from "@/components/ui/badge";

export interface ReorderItem {
  id: number;
  title: string;
  subtitle?: string;
  songKey?: string | null;
}

function SortableRow({ item, index }: { item: ReorderItem; index: number }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });

  return (
    <li
      ref={setNodeRef}
      data-dragging={isDragging}
      className="relative z-0 flex items-center gap-3 bg-background px-4 py-3 data-[dragging=true]:z-10 data-[dragging=true]:shadow-lg"
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      <span className="w-5 shrink-0 text-right text-muted-foreground text-sm tabular-nums">{index + 1}</span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{item.title}</p>
        {item.subtitle && <p className="truncate text-muted-foreground text-sm">{item.subtitle}</p>}
      </div>
      {item.songKey && (
        <Badge variant="outline" className="shrink-0 font-mono">
          {item.songKey}
        </Badge>
      )}
      <button
        ref={setActivatorNodeRef}
        type="button"
        {...attributes}
        {...listeners}
        // touch-none so a drag on the handle doesn't scroll the page on mobile
        className="flex size-10 shrink-0 cursor-grab touch-none items-center justify-center rounded-md text-muted-foreground hover:bg-accent active:cursor-grabbing"
        aria-label={`Drag to reorder ${item.title}`}
      >
        <GripVertical className="size-5" />
      </button>
    </li>
  );
}

export function ReorderList({ items, onReorder }: { items: ReorderItem[]; onReorder: (ids: number[]) => void }) {
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    const ids = items.map((i) => i.id);
    onReorder(arrayMove(ids, ids.indexOf(Number(active.id)), ids.indexOf(Number(over.id))));
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis, restrictToParentElement]}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <ul className="divide-y">
          {items.map((item, index) => (
            <SortableRow key={item.id} item={item} index={index} />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}
