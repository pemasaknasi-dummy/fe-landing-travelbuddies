import { httpClient } from "@/lib/api/http-client";

export type Gender = "Male" | "Female";

export interface ProfileUser {
  id: number;
  name: string;
  lastName: string | null;
  email: string;
  noKtp: string;
  phone: string;
  gender: Gender;
  dateOfBirth: string;
  photo: string;
  role: {
    id: number;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface IProfileUpdate {
  name: string | null;
  phone: string | null;
  noKtp: string | null;
  dateOfBirth?: Date | string | null;
  gender: Gender | null;
  photo: string | null;
}

export const profileApi = {
  getProfile: async () => {
    return httpClient.get<ProfileUser>(`/users/me`);
  },

  updateProfile: async (body: IProfileUpdate) => {
    return httpClient.put(`/users/me`, { ...body });
  },
};
