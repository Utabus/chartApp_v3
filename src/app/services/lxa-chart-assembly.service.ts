import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { BaseService } from './base.service';
import { ApiResponse } from '../models/api-response.model';
import { LXAChartAssembly } from '../models/dashboard-response.model';

@Injectable({ providedIn: 'root' })
export class LXAChartAssemblyService extends BaseService {
  constructor(http: HttpClient) {
    super(http, 'LXAChartAssembly');
  }
getAllAssembly(): Observable<LXAChartAssembly[]> {
  return this.getAll<ApiResponse<LXAChartAssembly[]>>().pipe(
    map(res => res.data)
  );
}


  getAssemblyById(id: number): Observable<LXAChartAssembly> {
    return this.http
      .get<ApiResponse<LXAChartAssembly>>(`${this.fullUrl}/${id}`)
      .pipe(map((res) => res.data));
  }

  createAssembly(data: LXAChartAssembly): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(this.fullUrl, data);
  }

  updateAssembly(id: number, data: LXAChartAssembly): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.fullUrl}/${id}`, data);
  }

  deleteAssembly(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.fullUrl}/${id}`);
  }
}
