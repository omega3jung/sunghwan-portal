import {
  Row,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { CSSProperties, SetStateAction, useMemo, useState } from "react";
import {
  AvatarMultiCombobox,
  Item,
} from "~/components/cynergy/AvatarMultiCombobox";
import { ValueLabel } from "~/types/common";
import { useFetchUser } from "../hooks/useFetchUser";
// needed for table body level scope DnD setup
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
// needed for row & cell level scope DnD setup
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { createColumnHelper } from "@tanstack/react-table";
import { ChevronUp, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "~/components/ui/button";
import { Combobox } from "~/components/ui/combobox";
import { Input } from "~/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableRow,
} from "~/components/ui/table";
import { cn } from "~/lib/utils";
import { Department } from "~/modules/service-hub/types";
import { StepData } from "../constants/interfaces";

type ApprovalStepListProps = {
  rowData: Department;
  data: StepData[];
  setData: (data: SetStateAction<StepData[]>) => void;
  departments: ValueLabel[];
  user: Item[];
  onAdd: (departmentId: number) => StepData;
  onEdit: (
    serviceHubDeptID: number,
    sequence: number,
    description: string,
    officeDeptID: string,
    agent: Array<string>
  ) => void;
  onMove: (serviceHubDeptID: number, movedItems: Array<StepData>) => void;
  onRemove: (departmentId: number, sequence: number) => void;
};

export const ApprovalStepDnDTable = (props: ApprovalStepListProps) => {
  const {
    rowData,
    data,
    setData,
    departments,
    user,
    onAdd,
    onEdit,
    onMove,
    onRemove,
  } = props;

  const { t: configText } = useTranslation("configuration");

  const [edittingRowKey, setEdittingRowKey] = useState<string>("0");
  const maxStepCount = 3;

  const dataIds = useMemo<UniqueIdentifier[]>(
    () => data?.map(({ shc_id }) => shc_id.toString()),
    [data]
  );

  const columnHelper = createColumnHelper<StepData>();

  const columns = [
    columnHelper.accessor("shc_seq", {
      header: configText("serviceHub.approvalStep.sequence"),
      enableSorting: true,
    }),
    columnHelper.accessor("shc_desc", {
      header: configText("serviceHub.approvalStep.stepName"),
      enableSorting: true,
    }),
    columnHelper.accessor("shc_did", {
      enableSorting: false,
      enableHiding: false,
    }),
    columnHelper.accessor("shc_agent", {
      header: configText("serviceHub.general.agent"),
      enableSorting: true,
    }),
    columnHelper.display({
      id: "active",
      enableSorting: false,
      enableHiding: false,
      header: configText("serviceHub.general.active"),
    }),
    columnHelper.accessor("shc_id", {
      enableSorting: false,
      enableHiding: false,
    }),
    columnHelper.accessor("shc_group_id", {
      enableSorting: false,
      enableHiding: false,
    }),
    columnHelper.accessor("shc_group", {
      header: configText("serviceHub.general.departement"),
      enableSorting: false,
    }),
    columnHelper.accessor("shc_dis", {
      enableSorting: false,
      enableHiding: false,
    }),
  ];

  const table = useReactTable({
    data,
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.shc_id.toString(), //required because row indexes will change
    getSortedRowModel: getSortedRowModel(),
  });

  // reorder rows after drag & drop
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active && over && active.id !== over.id) {
      setData((data) => {
        const oldIndex = dataIds.indexOf(active.id);
        const newIndex = dataIds.indexOf(over.id);

        const movedArray = [...arrayMove(data, oldIndex, newIndex)]; //this is just a splice util

        movedArray.forEach((item, index) => {
          item.shc_seq = index + 1;
        });

        onMove(rowData.shc_id, movedArray);

        return movedArray;
      });
    }
  };

  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  );

  return (
    <div className="flex">
      <div className="flex w-[19rem] gap-1 bg-sky-50 p-3 text-sm dark:bg-muted">
        <ChevronUp className="p-1" />
        <h6 className="pt-px">{rowData.shc_desc}</h6>
      </div>
      <div className="w-full">
        <DndContext
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
          onDragEnd={handleDragEnd}
          sensors={sensors}
        >
          <Table className="w-full">
            <TableBody>
              <SortableContext
                items={dataIds}
                strategy={verticalListSortingStrategy}
              >
                {table.getRowModel().rows.map((row) => (
                  <DraggableRow
                    key={row.id}
                    row={row}
                    setData={setData}
                    departments={departments}
                    user={user}
                    onAdd={onAdd}
                    onEdit={onEdit}
                    onRemove={onRemove}
                    edittingRowKey={edittingRowKey}
                    setEdittingRowKey={setEdittingRowKey}
                  />
                ))}
              </SortableContext>

              {data?.length < maxStepCount && (
                <TableRow
                  id={`new_row`}
                  key={`new_row`}
                  className="h-10 bg-sky-50 dark:bg-muted"
                >
                  <TableCell className="p-0">
                    <Button
                      className="text-primary"
                      variant="ghost"
                      onClick={() => {
                        const newItem = onAdd(rowData.shc_id);

                        setData((data) => {
                          const newData = [...data];

                          newData.push(newItem);

                          return newData;
                        });
                      }}
                    >
                      <Plus size="18" className="mr-2" />
                      {configText("serviceHub.approvalStep.addStep")}
                    </Button>
                  </TableCell>
                  <TableCell className="py-1"></TableCell>
                  <TableCell className="py-1"></TableCell>
                  <TableCell className="py-1"></TableCell>
                  <TableCell className="py-1"></TableCell>
                </TableRow>
              )}
            </TableBody>
            <TableFooter className="border-t">
              <TableRow
                id={`footer_row`}
                key={`footer_row`}
                className="bg-sky-50 dark:bg-muted"
              >
                <TableCell className="w-28 py-1">{data?.length + 1}</TableCell>
                <TableCell className="p-0">{rowData.shc_desc}</TableCell>
                <TableCell className="w-60"></TableCell>
                <TableCell className="w-36 px-1 py-0">
                  <AvatarMultiCombobox
                    options={user ?? []}
                    placeholder="Select Users"
                    value={rowData.shc_agent}
                    readOnly={true}
                    variant={"readOnly"}
                    maxImages={3}
                  />
                </TableCell>
                <TableCell className="w-28"></TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </DndContext>
      </div>
    </div>
  );
};

// Cell Component
const RowDragHandleCell = ({ rowId }: { rowId: string }) => {
  const { attributes, listeners } = useSortable({
    id: rowId,
  });

  return (
    // Alternatively, you could set these attributes on the rows themselves
    <button {...attributes} {...listeners} className="cursor-grab">
      🟰
    </button>
  );
};

// Row Component
const DraggableRow = ({
  row,
  setData,
  departments,
  user,
  onEdit,
  onRemove,
  edittingRowKey,
  setEdittingRowKey,
}: {
  row: Row<StepData>;
  setData: (data: SetStateAction<StepData[]>) => void;
  departments: ValueLabel[];
  user: Item[];
  onAdd: (departmentId: number) => void;
  onEdit: (
    serviceHubDeptID: number,
    sequence: number,
    description: string,
    officeDeptID: string,
    agent: Array<string>
  ) => void;
  onRemove: (departmentId: number, sequence: number) => void;
  edittingRowKey: string;
  setEdittingRowKey: (rowKey: string) => void;
}) => {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.shc_id,
  });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform), //let dnd-kit do its thing
    transition: transition,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 1 : 0,
  };

  const [edittingName, setEdittingName] = useState<string>("");
  const [edittingDept, setEdittingDept] = useState<string>("0");
  const [edittingAgent, setEdittingAgent] = useState<Array<string>>([]);

  const { data: filteredUsers } = useFetchUser(parseInt(edittingDept));

  const { t: configText } = useTranslation("configuration");

  return (
    <TableRow ref={setNodeRef} className={cn("bg-sky-50 dark:bg-muted", style)}>
      <TableCell className="w-28 py-1">
        <div className="flex items-center gap-4">
          {row.original.shc_seq}
          <RowDragHandleCell rowId={row.id}></RowDragHandleCell>
        </div>
      </TableCell>
      <TableCell className="p-0">
        {edittingRowKey !== row.id ? (
          <>{row.original.shc_desc}</>
        ) : (
          <Input
            max={100}
            value={edittingName}
            onChange={(e) => setEdittingName(e.target.value)}
            placeholder={`${configText("serviceHub.general.step")} ${
              row.original.shc_seq
            }`}
          />
        )}
      </TableCell>
      <TableCell className="w-60 p-0">
        {edittingRowKey !== row.id ? (
          <Combobox
            value={row.original.shc_did}
            className="h-8 max-w-52"
            options={departments}
            readOnly={true}
            variant={"readOnly"}
          />
        ) : (
          <Combobox
            value={edittingDept}
            className="h-8 max-w-52"
            placeholder={configText(
              "serviceHub.general.DepartmentComboboxPlaceholder"
            )}
            options={departments}
            onChange={(selectedItem) => {
              setEdittingDept(selectedItem);
              setEdittingAgent([]);
            }}
          />
        )}
      </TableCell>
      <TableCell className="w-36 px-1 py-0">
        {edittingRowKey !== row.id ? (
          <AvatarMultiCombobox
            options={user ?? []}
            placeholder={configText(
              "serviceHub.general.AvatarComboboxPlaceholder"
            )}
            value={row.original.shc_agent}
            readOnly={true}
            variant={"readOnly"}
            maxImages={3}
          />
        ) : (
          <AvatarMultiCombobox
            options={filteredUsers ?? []}
            placeholder={configText(
              "serviceHub.general.AvatarComboboxPlaceholder"
            )}
            value={edittingAgent}
            readOnly={false}
            onSelect={(selectedItem) => {
              if (!!selectedItem) {
                const newData = [...edittingAgent];

                newData.push(selectedItem);

                setEdittingAgent(newData);
              }
            }}
            onRemove={(selectedItem) => {
              const currentValue = [...edittingAgent];

              const currentValueindex = currentValue.indexOf(selectedItem);

              if (currentValueindex > -1) {
                currentValue.splice(currentValueindex, 1);
                setEdittingAgent(currentValue);
              } else {
                return;
              }
            }}
            variant={"default"}
            maxImages={3}
          />
        )}
      </TableCell>
      <TableCell className="w-28 p-0">
        {edittingRowKey !== row.id ? (
          <div className="flex text-center">
            <Button
              className="text-primary"
              variant="ghost"
              onClick={() => {
                setEdittingName(row.original.shc_desc);
                setEdittingDept(row.original.shc_did);
                setEdittingAgent(row.original.shc_agent);
                setEdittingRowKey(row.id);
              }}
            >
              <Pencil size="18" />
            </Button>
            <Button
              className="text-destructive"
              variant="ghost"
              onClick={() => {
                onRemove(row.original.shc_group_id, row.original.shc_seq);
                setData((data) => {
                  const newData = [...data];

                  newData.splice(row.original.shc_seq - 1, 1);

                  return newData;
                });
              }}
            >
              <Trash2 size="18" />
            </Button>
          </div>
        ) : (
          <div className="flex text-center">
            <Button
              variant="ghost"
              onClick={() => {
                onEdit(
                  row.original.shc_group_id,
                  row.original.shc_seq,
                  edittingName,
                  edittingDept,
                  edittingAgent
                );
                setEdittingName("");
                setEdittingDept("0");
                setEdittingAgent([]);
                setEdittingRowKey("0");
              }}
            >
              <Save className="text-secondary dark:text-basic" size="18" />
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setEdittingName("");
                setEdittingDept("0");
                setEdittingAgent([]);
                setEdittingRowKey("0");
              }}
            >
              <X className="text-secondary dark:text-basic" size="18" />
            </Button>
          </div>
        )}
      </TableCell>
    </TableRow>
  );
};
