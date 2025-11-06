import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { BaseService } from './base.service';

@Injectable({ providedIn: 'root' })
export class DashboardService extends BaseService {
  private dashboardDataSubject = new BehaviorSubject<any>(null);
  dashboardData$ = this.dashboardDataSubject.asObservable();

  constructor(http: HttpClient) {
    super(http, 'LxaChart'); // endpoint riêng cho dashboard
  }

  loadData(): Observable<any> {
    return this.getAll<any>().pipe(
      tap((data) => this.dashboardDataSubject.next(data))
    );
  }

  get currentData() {
    return this.dashboardDataSubject.value;
  }
}
