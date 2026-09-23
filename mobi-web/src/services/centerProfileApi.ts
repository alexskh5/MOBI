import { api } from "./api";

export type CenterProfile = {
  id: string;
  centerName: string;
  centerEmail: string;
  centerPhone: string;
  centerWebsite: string;
  centerOwnerName: string;
  centerOwnerPhone: string;
  centerOwnerEmail: string;
  contactPersonName: string;
  contactPersonPhone: string;
  contactPersonEmail: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  about: string;
  subscriptionStatus: string;
  isActive: boolean;
};

export type CenterProfileUpdate = Omit<
  Partial<CenterProfile>,
  "id" | "subscriptionStatus" | "isActive"
>;

export async function getCenterProfile() {
  const response = await api.get("/center/profile");
  return response.data.profile as CenterProfile;
}

export async function updateCenterProfile(
  payload: CenterProfileUpdate,
) {
  const response = await api.patch("/center/profile", payload);
  return response.data.profile as CenterProfile;
}
