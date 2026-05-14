import { Employee, LocalizedName } from "@/domain/organization";
import { idToNumber, numberToId } from "@/lib/api/utils/mapId";
import {
  createItemPayloadMapper,
  createListPayloadMapper,
} from "@/lib/api/utils/payload";
import { ArrayMapper } from "@/shared/types";
import { nullToUndefined, undefinedToNull } from "@/shared/utils/value";

// back-end data structures.
export interface DbEmployee {
  e_id: number;
  e_user_name: string;
  e_name: LocalizedName;
  e_phone: string;
  e_email: string;
  e_image_url: string | null;
  e_did: number;
  e_jfid: number;
  e_cid: number;
  e_start_date: Date;
  e_end_date: Date | null;
  e_wsid: number | null;
  e_active: boolean;
  e_engineer_id: number | null;
  e_rf_tag_id: string | null;
  e_hour_rate: number | null;
}

export const camelEmployeeMapper: ArrayMapper<DbEmployee, Employee> = (
  data,
) => {
  return data.map((item) => ({
    id: item.e_id,
    userName: item.e_user_name,
    name: item.e_name,
    phone: item.e_phone,
    email: item.e_email,
    imageUrl: nullToUndefined(item.e_image_url),
    departmentId: item.e_did.toString(),
    jobFieldId: item.e_jfid.toString(),
    companyId: item.e_cid.toString(),
    startDate: item.e_start_date,
    endDate: nullToUndefined(item.e_end_date),
    shiftId: numberToId(item.e_wsid),
    active: item.e_active,
    engineerId: numberToId(item.e_engineer_id),
    rfTagId: nullToUndefined(item.e_rf_tag_id),
    hourRate: nullToUndefined(item.e_hour_rate),
  }));
};

export const snakeEmployeeMapper: ArrayMapper<Employee, DbEmployee> = (
  data,
) => {
  return data.map((item) => ({
    e_id: item.id,
    e_user_name: item.userName,
    e_name: item.name,
    e_phone: item.phone,
    e_email: item.email,
    e_image_url: undefinedToNull(item.imageUrl),
    e_did: parseInt(item.departmentId),
    e_jfid: parseInt(item.jobFieldId),
    e_cid: parseInt(item.companyId),
    e_start_date: item.startDate,
    e_end_date: undefinedToNull(item.endDate),
    e_wsid: idToNumber(item.shiftId),
    e_active: item.active,
    e_engineer_id: idToNumber(item.engineerId),
    e_rf_tag_id: undefinedToNull(item.rfTagId),
    e_hour_rate: undefinedToNull(item.hourRate),
  }));
};

export const mapEmployeeListPayload =
  createListPayloadMapper(camelEmployeeMapper);
export const mapEmployeeItemPayload =
  createItemPayloadMapper(camelEmployeeMapper);
