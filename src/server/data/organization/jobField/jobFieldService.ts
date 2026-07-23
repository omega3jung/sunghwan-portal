import { JobFieldDto } from "./jobFieldDto";
import { mapJobFieldRowsToDtos } from "./jobFieldMapper";
import {
  findActiveJobFieldRows,
  findActiveJobFieldRowsByCompanyId,
} from "./jobFieldRepository";

export async function getActiveJobFields(): Promise<JobFieldDto[]> {
  const rows = await findActiveJobFieldRows();

  return mapJobFieldRowsToDtos(rows);
}

export async function getActiveJobFieldsByCompanyId(
  companyId: number,
): Promise<JobFieldDto[]> {
  const rows = await findActiveJobFieldRowsByCompanyId(companyId);

  return mapJobFieldRowsToDtos(rows);
}
