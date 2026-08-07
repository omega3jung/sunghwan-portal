import { JobFieldDto } from "./jobFieldDto";
import { mapJobFieldRowsToDtos } from "./jobFieldMapper";
import {
  findActiveJobFieldRows,
  findActiveJobFieldRowsByCompanyId,
} from "./jobFieldRepository";

/** Loads active job fields through the server data boundary. */
export async function getActiveJobFields(): Promise<JobFieldDto[]> {
  const rows = await findActiveJobFieldRows();

  return mapJobFieldRowsToDtos(rows);
}

/** Loads active job fields by company id through the server data boundary. */
export async function getActiveJobFieldsByCompanyId(
  companyId: number,
): Promise<JobFieldDto[]> {
  const rows = await findActiveJobFieldRowsByCompanyId(companyId);

  return mapJobFieldRowsToDtos(rows);
}
