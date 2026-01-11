import {
  SortingState,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table';
import { ChevronRight, Loader2, MoveDown, MoveUp } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AvatarMultiCombobox,
  Item
} from '~/components/cynergy/AvatarMultiCombobox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '~/components/ui/table';
import { Department } from '~/modules/service-hub/types';
import { ValueLabel } from '~/types/common';
import { DepartmentStepData, StepData } from '../constants/interfaces';
import { ApprovalStepDnDTable } from './ApprovalStepDnDTable';

type ApprovalStepListProps = {
  data: DepartmentStepData[];
  departments: ValueLabel[];
  user: Item[];
  isLoading: boolean;
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
  selectedRow?: Department;
  setSelectedRow: (item: Department) => void;
};

export const ApprovalStepTable = (props: ApprovalStepListProps) => {
  const {
    data,
    departments,
    user,
    isLoading,
    onAdd,
    onEdit,
    onMove,
    onRemove,
    selectedRow,
    setSelectedRow
  } = props;

  const { t: configText } = useTranslation('configuration');

  const [sorting, setSorting] = useState<SortingState>([]);
  const [stepData, setStepData] = useState<Array<StepData>>([]);

  const columnHelper = createColumnHelper<DepartmentStepData>();

  const columns = [
    columnHelper.accessor('shc_id', {
      header: configText('serviceHub.general.department'),
      enableSorting: false
    }),
    columnHelper.accessor('step', {
      header: configText('serviceHub.approvalStep.sequence'),
      enableSorting: true
    }),
    columnHelper.accessor('shc_desc', {
      header: configText('serviceHub.approvalStep.stepName'),
      enableSorting: true
    }),
    columnHelper.accessor('shc_did', {
      enableSorting: false,
      enableHiding: false
    }),
    columnHelper.accessor('shc_agent', {
      header: configText('serviceHub.general.agent'),
      enableSorting: true
    }),
    columnHelper.display({
      id: 'active',
      enableSorting: false,
      enableHiding: false,
      header: configText('serviceHub.general.active')
    }),
    columnHelper.accessor('shc_dis', {
      enableSorting: true
    })
  ];

  const table = useReactTable({
    data,
    columns: columns,
    state: {
      sorting
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel()
  });

  if (isLoading) {
    return (
      <div className="flex h-40 w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    );
  }

  return (
    <Table className="w-full">
      <TableHeader className="sticky bg-muted-primary text-black dark:text-primary">
        {table.getHeaderGroups().map((group) => (
          <TableRow key={group.id} className="sticky">
            <TableHead key={group.headers[0].id} className="w-60 py-1">
              <div
                className={'flex cursor-pointer select-none items-center gap-1'}
                onClick={group.headers[0].column.getToggleSortingHandler()}
              >
                {flexRender(
                  group.headers[0].column.columnDef.header,
                  group.headers[0].getContext()
                )}
                <div className="h-4 w-4">
                  <SortIcon
                    value={group.headers[1].column.getIsSorted() as string}
                  />
                </div>
              </div>
            </TableHead>
            <TableHead key={group.headers[1].id} className="w-28 py-1">
              {flexRender(
                group.headers[1].column.columnDef.header,
                group.headers[1].getContext()
              )}
            </TableHead>
            <TableHead key={group.headers[2].id} className="py-1">
              {flexRender(
                group.headers[2].column.columnDef.header,
                group.headers[2].getContext()
              )}
            </TableHead>
            <TableHead key={group.headers[3].id} className="w-60 py-1">
              {flexRender(
                group.headers[4].column.columnDef.header,
                group.headers[4].getContext()
              )}
            </TableHead>
            <TableHead
              key={group.headers[4].id}
              className="w-36 py-1"
            ></TableHead>
            <TableHead
              key={group.headers[5].id}
              className="w-28 py-1 text-center"
            >
              {flexRender(
                group.headers[5].column.columnDef.header,
                group.headers[5].getContext()
              )}
            </TableHead>
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows?.map((row) => (
          <TableRow
            id={`row_${row.id}`}
            key={`row_${row.id}`}
            onClick={() => {
              // when selected other row.
              if (row.original.shc_id !== selectedRow?.shc_id) {
                table.toggleAllPageRowsSelected(false);
                row.toggleSelected(true);
                setSelectedRow({
                  ...row.original
                } as Department);
                setStepData(row.original.step);
              }
            }}
          >
            {/* collapsed row */}
            {(row.getValue('shc_id') as number) !== selectedRow?.shc_id && (
              <>
                <TableCell className="flex items-center gap-1 p-3">
                  <ChevronRight className="p-1" />
                  {row.getValue('shc_desc')}
                </TableCell>
                <TableCell className="py-1">-</TableCell>
                <TableCell className="py-1"></TableCell>
                <TableCell className="py-1"></TableCell>
                <TableCell className="px-1 py-0">
                  <AvatarMultiCombobox
                    options={user ?? []}
                    placeholder={configText(
                      'serviceHub.general.AvatarComboboxPlaceholder'
                    )}
                    value={row.getValue('shc_agent')}
                    readOnly={true}
                    variant={'readOnly'}
                    maxImages={3}
                  />
                </TableCell>
                <TableCell className="flex py-1"></TableCell>
              </>
            )}

            {!!selectedRow &&
              row.getValue('shc_id') === selectedRow?.shc_id && (
                <TableCell colSpan={columns.length} className="p-0">
                  <ApprovalStepDnDTable
                    rowData={selectedRow}
                    data={stepData}
                    setData={setStepData}
                    departments={departments}
                    user={user}
                    onAdd={onAdd}
                    onEdit={onEdit}
                    onMove={onMove}
                    onRemove={onRemove}
                  />
                </TableCell>
              )}
          </TableRow>
        ))}

        {!table.getRowModel().rows?.length && (
          <TableRow id={'empty_row'} key={'empty_row'}>
            <TableCell colSpan={columns.length} className="h-24 text-center">
              {configText('serviceHub.approvalStep.noResults')}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

const SortIcon = ({ value }: { value: string }) => {
  if (value === 'asc') {
    return <MoveUp name="move-up" />;
  }

  if (value === 'desc') {
    return <MoveDown name="move-down" />;
  }

  return null;
};
