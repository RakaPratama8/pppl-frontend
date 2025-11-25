export enum StatusRekap {
  MASIH_JALAN = 'MASIH_JALAN',
  TIDAK_LAGI_PAKAI_PANJANG_KARAKTER_UNTUK_CATATAN = 'TIDAK_LAGI_PAKAI_PANJANG_KARAKTER_UNTUK_CATATAN'
}

export interface Rekap {
  idMeeting?: number;
  idKlien: number;
  namaKlien?: string;
  idManager: number;
  namaManager?: string;
  idLayanan: number;
  namaLayanan?: string;
  tglMeeting: Date | string;
  hasil: string;
  status: StatusRekap;
  catatan?: string;
}