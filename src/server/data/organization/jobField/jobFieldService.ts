import { JobFieldDto } from "./jobFieldDto";
import { mapJobFieldRowsToDtos } from "./jobFieldMapper";
import { findActiveJobFieldRows } from "./jobFieldRepository";

export async function getActiveJobFields(): Promise<JobFieldDto[]> {
  const rows = await findActiveJobFieldRows();

  return mapJobFieldRowsToDtos(rows);
}
