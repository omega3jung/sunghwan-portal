"use client";

import { Loader2 } from "lucide-react";
import type { ForwardedRef } from "react";
import { forwardRef, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxList,
  ComboboxTrigger,
} from "@/components/ui/combobox";
import { NS } from "@/lib/application/i18n";
import { cn } from "@/shared/utils/presentation";

import { comboBoxVariants } from "../variants";
import { TreeMultiComboBoxBadgeList } from "./TreeMultiComboBoxBadgeList";
import { TreeMultiComboBoxOptionItem } from "./TreeMultiComboBoxOptionItem";
import type { TreeMultiComboBoxNode, TreeMultiComboBoxProps } from "./types";
import {
  createTreeBadgeOrderMap,
  createTreeComboboxFilter,
  createTreeOptionIndex,
  flattenTreeOptions,
  getParentRenderState,
  getSelectedTreeItems,
  isChildSelected,
  normalizeTreeValues,
  toggleTreeValue,
} from "./utils";

const hasSameValues = (left: string[], right: string[]) => {
  if (left.length !== right.length) {
    return false;
  }

  const rightSet = new Set(right);

  return left.every((value) => rightSet.has(value));
};

/**
 * Controlled hierarchical multi-select with compressed branch semantics:
 * selecting a parent represents the whole branch, while child keys represent
 * partial selection. `onChange` takes precedence over delta callbacks.
 */
const Component = (
  {
    placeholder,
    options = [],
    value = [],
    onSelect,
    onRemove,
    onChange,
    variant,
    size,
    badgeVariant,
    paletteStart,
    palettePick,
    isLoading = false,
    disabled = false,
    readOnly = false,
    modal = true,
    className,
    ...buttonProps
  }: TreeMultiComboBoxProps,
  ref: ForwardedRef<HTMLButtonElement>,
) => {
  const { t } = useTranslation(NS.component, {
    keyPrefix: "comboBox",
  });
  const [search, setSearch] = useState("");
  const [expandedParentValues, setExpandedParentValues] = useState<string[]>(
    [],
  );

  const normalizedValue = useMemo(
    () => normalizeTreeValues(value, options),
    [options, value],
  );
  const optionIndex = useMemo(() => createTreeOptionIndex(options), [options]);
  const allNodes = useMemo(() => flattenTreeOptions(options), [options]);
  const nodeMap = useMemo(
    () => new Map(allNodes.map((node) => [node.value, node])),
    [allNodes],
  );
  const selectedNodes = useMemo(
    () =>
      normalizedValue
        .map((selectedValue) => nodeMap.get(selectedValue))
        .filter((node): node is TreeMultiComboBoxNode => Boolean(node)),
    [nodeMap, normalizedValue],
  );
  const selectedItems = useMemo(
    () => getSelectedTreeItems(normalizedValue, options),
    [normalizedValue, options],
  );
  const badgeOrderMap = useMemo(
    () => createTreeBadgeOrderMap(options),
    [options],
  );
  const comboboxFilter = useMemo(
    () => createTreeComboboxFilter(options),
    [options],
  );

  const isSearching = search.trim().length > 0;
  const expandedParentSet = useMemo(
    () => new Set(expandedParentValues),
    [expandedParentValues],
  );
  const visibleNodes = useMemo(
    () =>
      isSearching
        ? allNodes
        : allNodes.filter(
            (node) =>
              node.kind === "parent" || expandedParentSet.has(node.parentValue),
          ),
    [allNodes, expandedParentSet, isSearching],
  );

  const toggleExpandedParent = (parentValue: string) => {
    setExpandedParentValues((currentValues) =>
      currentValues.includes(parentValue)
        ? currentValues.filter((value) => value !== parentValue)
        : [...currentValues, parentValue],
    );
  };

  const emitSelectionChange = (nextValue: string[]) => {
    if (onChange) {
      onChange(nextValue);
      return;
    }

    const currentValueSet = new Set(normalizedValue);
    const nextValueSet = new Set(nextValue);

    for (const removedValue of normalizedValue) {
      if (!nextValueSet.has(removedValue)) {
        onRemove?.(removedValue);
      }
    }

    for (const addedValue of nextValue) {
      if (!currentValueSet.has(addedValue)) {
        onSelect?.(addedValue);
      }
    }
  };

  const handleToggleValue = (targetValue: string) => {
    if (disabled || readOnly) {
      return;
    }

    const nextValue = toggleTreeValue(targetValue, normalizedValue, options);

    if (!hasSameValues(normalizedValue, nextValue)) {
      emitSelectionChange(nextValue);
    }
  };

  const handleValueChange = (nextNodes: TreeMultiComboBoxNode[]) => {
    const currentValueSet = new Set(
      selectedNodes.map((selectedNode) => selectedNode.value),
    );
    const nextValueSet = new Set(nextNodes.map((node) => node.value));
    const changedNode =
      nextNodes.find((node) => !currentValueSet.has(node.value)) ??
      selectedNodes.find((node) => !nextValueSet.has(node.value));

    if (changedNode) {
      handleToggleValue(changedNode.value);
    }
  };

  return (
    <Combobox
      items={visibleNodes}
      value={selectedNodes}
      onValueChange={handleValueChange}
      inputValue={search}
      onInputValueChange={setSearch}
      filter={comboboxFilter}
      isItemEqualToValue={(item, selectedItem) =>
        item.value === selectedItem.value
      }
      multiple
      disabled={disabled}
      readOnly={readOnly}
      modal={modal}
    >
      <ComboboxTrigger
        render={
          <Button
            {...buttonProps}
            ref={ref}
            variant="outline"
            type="button"
            className={cn(comboBoxVariants({ variant, size }), className)}
            disabled={disabled || readOnly}
          />
        }
        icon={
          isLoading ? (
            <Loader2 className="pointer-events-none size-5 animate-spin" />
          ) : readOnly ? null : undefined
        }
      >
        {selectedItems.length === 0 ? (
          <div className="px-2 font-normal text-muted-foreground">
            {placeholder}
          </div>
        ) : (
          <TreeMultiComboBoxBadgeList
            items={selectedItems}
            itemOrderMap={badgeOrderMap}
            badgeVariant={badgeVariant ?? "default"}
            paletteStart={paletteStart ?? 1}
            palettePick={palettePick}
            readOnly={readOnly}
            onRemove={handleToggleValue}
          />
        )}
      </ComboboxTrigger>

      <ComboboxContent>
        <ComboboxInput
          aria-label={placeholder ?? t("searchTreeOptions")}
          placeholder={placeholder}
          showTrigger={false}
        />
        <ComboboxEmpty>{t("empty")}</ComboboxEmpty>
        <ComboboxList showScrollbar className="max-h-64 min-h-0">
          {(item) => {
            if (item.kind === "parent") {
              const state = getParentRenderState(item, normalizedValue);

              return (
                <TreeMultiComboBoxOptionItem
                  key={item.value}
                  item={item}
                  checkState={state.checkState}
                  disabled={state.disabled}
                  expanded={isSearching || expandedParentSet.has(item.value)}
                  selectedChildCount={state.selectedChildCount}
                  totalChildCount={state.totalChildCount}
                  onToggleExpand={toggleExpandedParent}
                />
              );
            }

            return (
              <TreeMultiComboBoxOptionItem
                key={item.value}
                item={item}
                checkState={
                  isChildSelected(item.value, normalizedValue, optionIndex)
                    ? "checked"
                    : "unchecked"
                }
                disabled={Boolean(
                  item.disabled ||
                  optionIndex.parentMap.get(item.parentValue)?.disabled,
                )}
              />
            );
          }}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
};

export const TreeMultiComboBox = forwardRef<
  HTMLButtonElement,
  TreeMultiComboBoxProps
>(Component);

TreeMultiComboBox.displayName = "TreeMultiComboBox";
