export enum StatusKlien {
  BELUM = 'BELUM',
  AKTIF = 'AKTIF'
}

export interface Klien {
  idKlien?: number;
  namaKlien: string;
  emailKlien: string;
  noTelp: string;
  status: StatusKlien;
  tglRequest: Date | string;
}