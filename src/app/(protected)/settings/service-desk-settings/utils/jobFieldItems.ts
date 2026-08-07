import type { HierarchicalSelectItem } from "@/components/custom/HierarchicalSelect";
import type { Department, JobField } from "@/domain/organization";
import type { LocalizedText } from "@/shared/types";

import { buildHierarchicalSelectItems } from "./hierarchy";

const DEPARTMENT_VALUE_PREFIX = "department:";

type BuildJobFieldItemsOptions = {
  departments: readonly Department[];
  jobFields: readonly JobField[];
  selectedJobFieldIds: readonly string[];
  getLocalizedText: (value: LocalizedText) => string;
  fallbackDepartmentLabel: string;
};

export function buildJobFieldItems({
  departments,
  jobFields,
  selectedJobFieldIds,
  getLocalizedText,
  fallbackDepartmentLabel,
}: BuildJobFieldItemsOptions): HierarchicalSelectItem[] {
  const jobFieldsByDepartmentId = new Map<string, HierarchicalSelectItem[]>();
  const jobFieldIds = new Set<string>();

  for (const jobField of jobFields) {
    const departmentJobFields =
      jobFieldsByDepartmentId.get(jobField.departmentId) ?? [];

    departmentJobFields.push({
      value: jobField.id,
      label: getLocalizedText(jobField.name),
    });
    jobFieldsByDepartmentId.set(jobField.departmentId, departmentJobFields);
    jobFieldIds.add(jobField.id);
  }

  const departmentItems = buildHierarchicalSelectItems(
    departments.map((department) => ({
      id: toDepartmentValue(department.id),
      parentId: department.parentId
        ? toDepartmentValue(department.parentId)
        : undefined,
      label: getLocalizedText(department.name),
    })),
  );
  const knownDepartmentIds = new Set<string>();
  const items = appendJobFieldsToDepartments(
    departmentItems,
    jobFieldsByDepartmentId,
    knownDepartmentIds,
  );

  for (const [departmentId, children] of jobFieldsByDepartmentId) {
    if (!knownDepartmentIds.has(departmentId)) {
      items.push({
        value: toDepartmentValue(departmentId),
        label: departmentId || fallbackDepartmentLabel,
        children,
      });
    }
  }

  for (const selectedJobFieldId of selectedJobFieldIds) {
    if (!jobFieldIds.has(selectedJobFieldId)) {
      items.push({
        value: toDepartmentValue(`fallback:${selectedJobFieldId}`),
        label: fallbackDepartmentLabel,
        children: [
          {
            value: selectedJobFieldId,
            label: selectedJobFieldId,
          },
        ],
      });
    }
  }

  return items;
}

function toDepartmentValue(departmentId: string) {
  return `${DEPARTMENT_VALUE_PREFIX}${departmentId}`;
}

function appendJobFieldsToDepartments(
  departmentItems: readonly HierarchicalSelectItem[],
  jobFieldsByDepartmentId: ReadonlyMap<string, HierarchicalSelectItem[]>,
  knownDepartmentIds: Set<string>,
): HierarchicalSelectItem[] {
  return departmentItems.flatMap((departmentItem) => {
    const departmentId = departmentItem.value.slice(
      DEPARTMENT_VALUE_PREFIX.length,
    );
    knownDepartmentIds.add(departmentId);

    const childDepartments = appendJobFieldsToDepartments(
      departmentItem.children ?? [],
      jobFieldsByDepartmentId,
      knownDepartmentIds,
    );
    const departmentJobFields =
      jobFieldsByDepartmentId.get(departmentId) ?? [];
    const children = [...childDepartments, ...departmentJobFields];

    return children.length > 0
      ? [
          {
            ...departmentItem,
            children,
          },
        ]
      : [];
  });
}
