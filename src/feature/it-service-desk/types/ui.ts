export interface FilterSetting {
  department: Array<number>;
  category: Array<number>;
  status: Array<string>;
  agent: Array<string>;
  requester: Array<string>;
  period_type: string;
  start_date: string;
  end_date: string;
  due_by: string;
  priority: Array<string>;
  keyword: string;
}
