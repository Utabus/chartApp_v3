export interface DashboardResponse {
  statusCode: number;
  message: string;
  data: DashboardData;
  errors: any;
  meta: any;
}

export interface DashboardData {
  assembly: AssemblyData;
  renishaw: RenishawData;
  shipment: ShipmentData;
  tableout: TableOutItem[];
}

export interface AssemblyData {
  data: number[];
  hour: number[];
}

export interface RenishawData {
  data: number[];
  hour: number[];
  person: PersonData | null;
}

export interface PersonData {
  id: string;
  name: string;
}

export interface ShipmentData {
  deliveryDate: string[];
  actual: number[];
  target: number[];
}

export interface TableOutItem {
  id: string;
  name: string;
  total: number;
  err: number;
  machine : string;
}
export interface DashboardResponse {
  statusCode: number;
  message: string;
  data: DashboardData;
  errors: any;
  meta: any;
}

export interface DashboardData {
  assembly: AssemblyData;
  renishaw: RenishawData;
  shipment: ShipmentData;
  tableout: TableOutItem[];
}

export interface AssemblyData {
  data: number[];
  hour: number[];
}

export interface RenishawData {
  data: number[];
  hour: number[];
  person: PersonData | null;
}

export interface PersonData {
  id: string;
  name: string;
}

export interface ShipmentData {
  deliveryDate: string[];
  actual: number[];
  target: number[];
}

export interface TableOutItem {
  id: string;
  name: string;
  total: number;
  err: number;
}
export interface LXAChartAssembly {
  id: number;
  code_NV: string;
  name: string;
  code_Name: string;
  targetGr: number;
  actualGr: number;
  actualMember: number;
}
