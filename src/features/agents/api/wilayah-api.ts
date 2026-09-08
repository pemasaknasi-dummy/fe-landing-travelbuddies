export interface WilayahItem {
  id: string;
  name: string;
}

export type Provinsi = WilayahItem;

export interface KabupatenKota extends WilayahItem {
  province_id: string;
}

export interface Kecamatan extends WilayahItem {
  regency_id: string;
}

export interface Kelurahan extends WilayahItem {
  district_id: string;
}

export interface PostalCodeItem {
  code: string;
  postalcode?: string;
  village?: string;
  urban?: string;
  district?: string;
  regency?: string;
  city?: string;
  province?: string;
}

const BASE_URL = "https://www.emsifa.com/api-wilayah-indonesia/api";

export const wilayahApi = {
  getProvinces: async (): Promise<Provinsi[]> => {
    const res = await fetch(`${BASE_URL}/provinces.json`);
    if (!res.ok) {
      throw new Error(`Gagal memuat data provinsi (${res.status})`);
    }
    return res.json();
  },

  getRegencies: async (provinceId: string): Promise<KabupatenKota[]> => {
    if (!provinceId) return [];
    const res = await fetch(`${BASE_URL}/regencies/${provinceId}.json`);
    if (!res.ok) {
      throw new Error(`Gagal memuat data kabupaten/kota (${res.status})`);
    }
    return res.json();
  },

  getDistricts: async (regencyId: string): Promise<Kecamatan[]> => {
    if (!regencyId) return [];
    const res = await fetch(`${BASE_URL}/districts/${regencyId}.json`);
    if (!res.ok) {
      throw new Error(`Gagal memuat data kecamatan (${res.status})`);
    }
    return res.json();
  },

  getVillages: async (districtId: string): Promise<Kelurahan[]> => {
    if (!districtId) return [];
    const res = await fetch(`${BASE_URL}/villages/${districtId}.json`);
    if (!res.ok) {
      throw new Error(`Gagal memuat data kelurahan (${res.status})`);
    }
    return res.json();
  },

  getPostalCodes: async (query: string): Promise<PostalCodeItem[]> => {
    if (!query?.trim()) return [];
    try {
      const res = await fetch(
        `https://kodepos.vercel.app/search?q=${encodeURIComponent(query.trim())}`
      );
      if (!res.ok) return [];
      const json = await res.json();
      const rawList = Array.isArray(json?.data) ? json.data : [];
      return rawList
        .map((item: Record<string, unknown>) => {
          const rawCode = item.code ?? item.postalcode ?? "";
          const codeStr = String(rawCode).trim();
          return {
            code: codeStr,
            postalcode: codeStr,
            village: String(item.village || item.urban || ""),
            urban: String(item.village || item.urban || ""),
            district: String(item.district || ""),
            regency: String(item.regency || item.city || ""),
            city: String(item.regency || item.city || ""),
            province: String(item.province || ""),
          };
        })
        .filter((item: PostalCodeItem) => Boolean(item.code));
    } catch {
      return [];
    }
  },
};
