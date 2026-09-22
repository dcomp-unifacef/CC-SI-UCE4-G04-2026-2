export type UpdatePatientDto = {
  id?: string; 
  name?: string;      
  cpf?: string;
  birthDate?: Date | string;
  phone: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  notes?: string;
}