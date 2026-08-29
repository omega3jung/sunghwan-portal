import { describe, expect, it, vi } from "vitest";

import { createItemPayloadMapper, createListPayloadMapper } from "./payload";

describe("API payload mappers", () => {
  it("maps list items while preserving envelope metadata and explicit totals", () => {
    const mapList = createListPayloadMapper((items: number[]) =>
      items.map(String),
    );

    expect(mapList({ items: [1, 2], total: 20, cursor: "next" })).toEqual({
      items: ["1", "2"],
      total: 20,
      cursor: "next",
    });
    expect(mapList({ items: [1, 2] })).toEqual({
      items: ["1", "2"],
      total: 2,
    });
  });

  it("leaves non-envelope list payloads untouched without invoking the mapper", () => {
    const mapper = vi.fn((items: number[]) => items.map(String));
    const mapList = createListPayloadMapper(mapper);
    const payload = { data: [1, 2] };

    expect(mapList(payload)).toBe(payload);
    expect(mapper).not.toHaveBeenCalled();
  });

  it("maps record item payloads and preserves unsupported or empty results", () => {
    const mapItem = createItemPayloadMapper(
      (items: Array<{ id: number }>) => items.map(({ id }) => ({ id: String(id) })),
    );
    const unsupported = [1, 2];

    expect(mapItem({ id: 7 })).toEqual({ id: "7" });
    expect(mapItem(unsupported)).toBe(unsupported);

    const emptyMapper = createItemPayloadMapper(() => [] as never[]);
    const original = { id: 8 };
    expect(emptyMapper(original)).toBe(original);
  });
});
