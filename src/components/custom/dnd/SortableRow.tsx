import { UniqueIdentifier } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ComponentPropsWithoutRef, CSSProperties, forwardRef } from "react";

import { TableRow } from "@/components/ui/table";

type SortableRowProps = {
  id: UniqueIdentifier;
} & ComponentPropsWithoutRef<typeof TableRow>;

export const SortableRow = forwardRef<HTMLTableRowElement, SortableRowProps>(
  ({ id, style, children, ...props }, ref) => {
    const { setNodeRef, transform, transition, isDragging } = useSortable({
      id,
    });

    const sortableStyle: CSSProperties = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.8 : 1,
      ...style,
    };

    return (
      <TableRow
        {...props}
        ref={(node) => {
          setNodeRef(node);
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        style={sortableStyle}
      >
        {children}
      </TableRow>
    );
  },
);

SortableRow.displayName = "SortableRow";
