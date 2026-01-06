export interface User {
  phone: string;
  email: string;
  address1: string;
  address2: string;
  department: string;
  department_id: number;
  job_field: string;
  job_field_id: number;
  shift: { from: Date; to: Date };
  disabled: boolean;
  name: { first: string; middle: string; last: string };
  start_date: Date;
  end_date: Date;
  company: string;
  company_id: string;
  image_url: string;
  hour_rate: number;
  engineer_id: string;
  pass_token: string;
  client: string;
  client_id: number;
}
