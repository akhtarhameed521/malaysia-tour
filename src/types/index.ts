export interface ApiMessage {
  message: string;
}

declare module "express-serve-static-core" {
  interface Request {
    user?: {
      id: number;
      employeeId: string;
      fullName: string;
    };
  }
}

export interface ApiMessageData extends ApiMessage {
  data: object;
  image?: string;
}

export interface ApiMessageDataPagination extends ApiMessageData {
  page: number;
  lastPage: number;
  total: number;
}

export enum StatusEnum {
  Active = "Active",
  Deactivate = "Deactivate",
}

export enum UserRoles {
  Admin = "Admin",
  User = "User",
  Staff = "Staff",
  Vendor = "Vendor",
  ServiceProvider = "Service Provider",
  Buyer = "Buyer",
  Supplementary = "Supplementary",
}

export enum AccountType {
  Individual = "Individual",
  Corporate = "Corporate",
}

export enum BookingStatus {
  Pending = "Pending",
  ServiceStarted = "Service Started",
  ServiceCompleted = "Service Completed",
  ServiceCancelled = "Service Cancelled",
}