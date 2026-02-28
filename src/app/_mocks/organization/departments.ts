import { DbDepartment } from "@/api/organization/department/mapper";

export const departmentsMock: DbDepartment[] = [
  /*  Head Office  */
  {
    department_id: "1",
    department_name: { en: "Corporate" },
    department_code: "CO",
    department_description: { en: "Main department" },
    department_parent_id: "0",
    department_active: true,
  },
  {
    department_id: "2",
    department_name: { en: "Human Resources" },
    department_code: "HRE",
    department_description: { en: "" },
    department_parent_id: "1",
    department_active: true,
  },
  {
    department_id: "3",
    department_name: { en: "Finance" },
    department_code: "FIN",
    department_description: { en: "" },
    department_parent_id: "1",
    department_active: true,
  },
  {
    department_id: "4",
    department_name: { en: "Sales" },
    department_code: "SAL",
    department_description: { en: "" },
    department_parent_id: "1",
    department_active: true,
  },
  {
    department_id: "5",
    department_name: { en: "Customer Support" },
    department_code: "CUS",
    department_description: { en: "" },
    department_parent_id: "1",
    department_active: true,
  },
  {
    department_id: "9",
    department_name: { en: "Security" },
    department_code: "SEC",
    department_description: { en: "Physical security" },
    department_parent_id: "1",
    department_active: true,
  },

  /*  IT  */
  {
    department_id: "10",
    department_name: { en: "IT" },
    department_code: "IT",
    department_description: { en: "" },
    department_parent_id: "0",
    department_active: true,
  },
  {
    department_id: "11",
    department_name: { en: "Infrastructure" },
    department_code: "INF",
    department_description: { en: "" },
    department_parent_id: "10",
    department_active: true,
  },
  {
    department_id: "12",
    department_name: { en: "Application Development" },
    department_code: "APP",
    department_description: { en: "" },
    department_parent_id: "10",
    department_active: true,
  },
  {
    department_id: "13",
    department_name: { en: "IT Support" },
    department_code: "ISP",
    department_description: {
      en: "Management of PCs, peripherals, and network equipment",
    },
    department_parent_id: "10",
    department_active: true,
  },
  {
    department_id: "14",
    department_name: { en: "IT Security" },
    department_code: "ISC",
    department_description: {
      en: "Management of IT security policies and systems",
    },
    department_parent_id: "10",
    department_active: true,
  },

  /*  Repair Center  */
  {
    department_id: "20",
    department_name: { en: "Repair Center" },
    department_code: "RC",
    department_description: {
      en: "Department responsible for device repair and refurbishment operations",
    },
    department_parent_id: "0",
    department_active: true,
  },
  {
    department_id: "21",
    department_name: { en: "Triage" },
    department_code: "TRI",
    department_description: { en: "Initial inspection and device triage" },
    department_parent_id: "20",
    department_active: true,
  },
  {
    department_id: "22",
    department_name: { en: "Repair" },
    department_code: "REP",
    department_description: { en: "Device repair and remanufacturing" },
    department_parent_id: "20",
    department_active: true,
  },
  {
    department_id: "31",
    department_name: { en: "Google" },
    department_code: "GGLE",
    department_description: {
      en: "Repair and refurbishment of Google devices",
    },
    department_parent_id: "22",
    department_active: true,
  },
  {
    department_id: "32",
    department_name: { en: "Samsung" },
    department_code: "SAMS",
    department_description: {
      en: "Repair and refurbishment of Samsung devices",
    },
    department_parent_id: "22",
    department_active: true,
  },
  {
    department_id: "33",
    department_name: { en: "Non-phone" },
    department_code: "NOP",
    department_description: {
      en: "Management of non-phone devices requiring repair or refurbishment",
    },
    department_parent_id: "22",
    department_active: true,
  },
  {
    department_id: "34",
    department_name: { en: "Home Devices" },
    department_code: "HOME",
    department_description: {
      en: "Smart home device triage, QC, and packaging",
    },
    department_parent_id: "33",
    department_active: true,
  },
  {
    department_id: "35",
    department_name: { en: "Wearables" },
    department_code: "WEAR",
    department_description: {
      en: "Triage, QC, and packaging of wearable devices",
    },
    department_parent_id: "33",
    department_active: true,
  },
  {
    department_id: "36",
    department_name: { en: "Accessories" },
    department_code: "ACCS",
    department_description: {
      en: "Triage, QC, and packaging of accessory devices",
    },
    department_parent_id: "33",
    department_active: true,
  },

  {
    department_id: "23",
    department_name: { en: "Quality Control" },
    department_code: "QCL",
    department_description: { en: "Quality inspection and device grading" },
    department_parent_id: "20",
    department_active: true,
  },
  {
    department_id: "24",
    department_name: { en: "Harvest" },
    department_code: "HAV",
    department_description: {
      en: "Device disassembly for parts harvesting and reuse",
    },
    department_parent_id: "20",
    department_active: true,
  },
  {
    department_id: "25",
    department_name: { en: "Polishing" },
    department_code: "POL",
    department_description: {
      en: "Cosmetic polishing and cleaning before packaging",
    },
    department_parent_id: "20",
    department_active: false,
  },
  {
    department_id: "26",
    department_name: { en: "Packaging" },
    department_code: "PKG",
    department_description: {
      en: "Device packaging and preparation for outbound shipment",
    },
    department_parent_id: "20",
    department_active: true,
  },
  {
    department_id: "27",
    department_name: { en: "Parts Inventory" },
    department_code: "PIV",
    department_description: { en: "Parts and consumables for repairs" },
    department_parent_id: "20",
    department_active: true,
  },
  {
    department_id: "28",
    department_name: { en: "Tech Support" },
    department_code: "TCS",
    department_description: {
      en: "Maintenance of repair equipment and diagnostic tools",
    },
    department_parent_id: "20",
    department_active: true,
  },

  /*  Logistics  */
  {
    department_id: "70",
    department_name: { en: "Logistics" },
    department_code: "LO",
    department_description: {
      en: "Management of inbound and outbound device shipments",
    },
    department_parent_id: "0",
    department_active: true,
  },
  {
    department_id: "71",
    department_name: { en: "Warehouse" },
    department_code: "WAH",
    department_description: {
      en: "Storage and inventory management of packaged devices",
    },
    department_parent_id: "70",
    department_active: true,
  },
  {
    department_id: "72",
    department_name: { en: "Inbound Dock" },
    department_code: "IND",
    department_description: { en: "Inbound shipment receiving and processing" },
    department_parent_id: "70",
    department_active: true,
  },
  {
    department_id: "73",
    department_name: { en: "Outbound Dock" },
    department_code: "OTD",
    department_description: {
      en: "Outbound shipment preparation and dispatch",
    },
    department_parent_id: "70",
    department_active: true,
  },
];

export const allDepartmentsMock: DbDepartment[] = [
  /*  Company  */
  {
    department_id: "0",
    department_name: { en: "Company" },
    department_code: "C",
    department_description: { en: "Company" },
    department_parent_id: null,
    department_active: true,
  },
  ...departmentsMock,
];
