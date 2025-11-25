export enum StatusRequest {
  MENUNGGU_VERIFIKASI = 'MENUNGGU_VERIFIKASI',
  VERIFIKASI = 'VERIFIKASI',
  DITOLAK = 'DITOLAK'
}

export interface RequestLayanan {
  idRequest?: number;
  idLayanan: number;
  namaLayanan?: string;
  idKlien: number;
  namaKlien?: string;
  tglRequest: Date | string;
  status: StatusRequest;
  tglVerifikasi?: Date | string;
  keteranganPenolakan?: string;
}