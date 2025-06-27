export interface User {
  id?: number;
  username?: string;
  lastName?: string;
  email: string;
  role?: string;
  password?: string;
  currentPassword?: string;
  Gender?: string;
  Address?: string;
  isDeleted?: boolean;
}
export interface PasswordData {
  id: string;
  currentPassword: string;
  password: string;
}
