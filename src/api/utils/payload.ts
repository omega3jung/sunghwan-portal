/**
 * Generic payload helpers for the read-mapping layer.
 *
 * These utilities are shared by resource `mapper.ts` files when the backend
 * returns common list/item response envelopes and each mapper only wants to
 * focus on DTO -> domain conversion.
 *
 * This lives in `src/api/utils` rather than `app/api/_helpers` because it is
 * not a route-layer concern. It is a reusable API mapping helper that can be
 * used anywhere in the API adapter layer.
 */
type ListPayload<T> = {
  items: T[];
  total?: number;
};

/**
 * Reuses a resource-specific array mapper for list responses shaped like
 * `{ items, total }`, while keeping the resource mapper free from wrapper
 * boilerplate.
 */
export function createListPayloadMapper<TInput, TOutput>(
  mapper: (items: TInput[]) => TOutput[],
) {
  return (payload: unknown) => {
    if (!isListPayload<TInput>(payload)) {
      return payload;
    }

    const items = mapper(payload.items);

    return {
      ...payload,
      items,
      total: typeof payload.total === "number" ? payload.total : items.length,
    };
  };
}

/**
 * Reuses a resource-specific array mapper for single-item payloads.
 * This keeps item response handling consistent across resource mappers without
 * pushing route-layer concerns back into `app/api`.
 */
export function createItemPayloadMapper<TInput, TOutput>(
  mapper: (items: TInput[]) => TOutput[],
) {
  return (payload: unknown) => {
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      return payload;
    }

    const [item] = mapper([payload as TInput]);
    return item ?? payload;
  };
}

function isListPayload<T>(payload: unknown): payload is ListPayload<T> {
  return (
    !!payload &&
    typeof payload === "object" &&
    "items" in payload &&
    Array.isArray((payload as ListPayload<T>).items)
  );
}
