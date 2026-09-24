import { DeviceStatus } from "../../generated/prisma/enums";

export type CreateDeviceDto = {
  serialNumber: string;
  manufacturer?: string;
  model?: string;
  status?: DeviceStatus;
  acquisitionDate?: Date | string;
  notes?: string;
};
