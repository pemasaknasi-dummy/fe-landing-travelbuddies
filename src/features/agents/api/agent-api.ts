import { httpClient } from "@/lib/api/http-client";

export interface PayloadAgentSubmission {
  agentName: string;
  ownerName: string;
  noKtp?: string; // Optional
  address: string; // Detail Alamat (Jalan / Gedung / Nomor / Lantai)
  province?: string; // Optional structured field
  city?: string; // Optional structured field
  district?: string; // Optional structured field
  subdistrict?: string; // Optional structured field
  postalCode?: string; // Optional structured field
  picName: string;
  picPhone: string;
  email: string;
  instagram?: string; // Nullable
  website?: string; // Nullable
  ktpUrl: File; // Mandatory
  nibUrl?: File; // Optional
  npwpUrl?: File; // Optional
  reason: string | null;
}

export const agentApi = {
  postAgentSubmission: async (payload: PayloadAgentSubmission) => {
    // Buat FormData untuk mengirim file
    const formData = new FormData();

    // Append semua field ke FormData
    formData.append("agentName", payload.agentName);
    formData.append("ownerName", payload.ownerName);
    if (payload.noKtp) {
      formData.append("noKtp", payload.noKtp);
    }
    formData.append("address", payload.address);
    if (payload.province) {
      formData.append("province", payload.province);
    }
    if (payload.city) {
      formData.append("city", payload.city);
    }
    if (payload.district) {
      formData.append("district", payload.district);
    }
    if (payload.subdistrict) {
      formData.append("subdistrict", payload.subdistrict);
    }
    if (payload.postalCode) {
      formData.append("postalCode", payload.postalCode);
    }
    formData.append("picName", payload.picName);
    formData.append("picPhone", payload.picPhone);
    formData.append("email", payload.email);

    if (payload.instagram) {
      formData.append("instagram", payload.instagram);
    }

    if (payload.website) {
      formData.append("website", payload.website);
    }

    if (payload.reason) {
      formData.append("reason", payload.reason);
    }

    // Append files
    formData.append("ktpUrl", payload.ktpUrl);
    if (payload.nibUrl) {
      formData.append("nibUrl", payload.nibUrl);
    }
    if (payload.npwpUrl) {
      formData.append("npwpUrl", payload.npwpUrl);
    }

    // Kirim sebagai FormData, jangan set Content-Type
    return httpClient.post("/agent", formData);
  },
};
