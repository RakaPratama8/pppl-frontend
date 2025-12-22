import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface RequestLayananDTO {
  idRequest?: number;
  idLayanan: number;
  namaLayanan?: string;
  idKlien: number;
  namaKlien?: string;
  tglRequest?: Date | string;
  status: 'MENUNGGU_VERIFIKASI' | 'VERIFIKASI' | 'DITOLAK';
  tglVerifikasi?: Date | string;
  keteranganPenolakan?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

export interface RequestDetailDTO extends RequestLayananDTO {
  emailKlien?: string;
  noTelpKlien?: string;
  kategoriLayanan?: string;
  perusahaan?: string;
  topic?: string;
  pesan?: string;
  anggaran?: string;
  waktuImplementasi?: string;
  skorPrioritas?: string;
  kategoriLead?: string;
  alasanSkor?: string;
  aiAnalyzed?: boolean;
}

export interface RequestStatistics {
  total: number;
  menungguVerifikasi: number;
  diverifikasi: number;
  ditolak: number;
}

@Injectable({
  providedIn: 'root'
})
export class RequestLayananService {
  private apiUrl = `${environment.apiUrl}/admin/request-layanan`;

  constructor(private http: HttpClient) {}

  getAllRequests(): Observable<ApiResponse<RequestLayananDTO[]>> {
    return this.http.get<ApiResponse<RequestLayananDTO[]>>(this.apiUrl);
  }

  getRequestById(id: number): Observable<ApiResponse<RequestDetailDTO>> {
    return this.http.get<ApiResponse<RequestDetailDTO>>(`${this.apiUrl}/${id}`);
  }

  getRequestsByStatus(status: string): Observable<ApiResponse<RequestLayananDTO[]>> {
    return this.http.get<ApiResponse<RequestLayananDTO[]>>(`${this.apiUrl}/status/${status}`);
  }

  approveRequest(id: number): Observable<ApiResponse<RequestLayananDTO>> {
    return this.http.post<ApiResponse<RequestLayananDTO>>(`${this.apiUrl}/${id}/approve`, {});
  }

  rejectRequest(id: number, keterangan: string): Observable<ApiResponse<RequestLayananDTO>> {
    return this.http.post<ApiResponse<RequestLayananDTO>>(`${this.apiUrl}/${id}/reject`, { keterangan });
  }

  searchRequests(keyword?: string, status?: string): Observable<ApiResponse<RequestLayananDTO[]>> {
    let params = new HttpParams();
    if (keyword) params = params.set('keyword', keyword);
    if (status) params = params.set('status', status);
    return this.http.get<ApiResponse<RequestLayananDTO[]>>(`${this.apiUrl}/search`, { params });
  }

  getStatistics(): Observable<ApiResponse<RequestStatistics>> {
    return this.http.get<ApiResponse<RequestStatistics>>(`${this.apiUrl}/statistics`);
  }
}