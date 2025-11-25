export enum KategoriLayanan {
  SOSIAL = 'SOSIAL',
  PIRANTI_LUNAK = 'PIRANTI_LUNAK',
  MULTIMEDIA = 'MULTIMEDIA',
  MESIN_SEKURITAS = 'MESIN_SEKURITAS'
}

export interface Layanan {
  idLayanan?: number;
  namaLayanan: string;
  kategori: KategoriLayanan;
  catatan?: string;
}