export const createIncrementalIdAssigner = (existingIds: number[]) => {
  let nextId = Math.max(0, ...existingIds.filter(Number.isFinite)) + 1;

  return () => {
    const assignedId = String(nextId);
    nextId += 1;
    return assignedId;
  };
};
