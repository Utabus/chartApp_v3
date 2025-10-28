import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private apiUrl = 'http://192.168.100.100:8091/api/LxaChart'; // thay bằng API thật

  private dashboardDataSubject = new BehaviorSubject<any>(null);

  dashboardData$ = this.dashboardDataSubject.asObservable();

  constructor(private http: HttpClient) {}

  loadData(): Observable<any> {
    return this.http.get(this.apiUrl).pipe(
      tap((data) => {
        this.dashboardDataSubject.next(data); 
      })
    );
  }

  get currentData() {
    return this.dashboardDataSubject.value;
  }
}
