import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export class BaseService {
  protected readonly apiUrl = "http://192.168.100.100:8091/api/";
  private headers = new HttpHeaders({ 'Content-Type': 'application/json' });

  constructor(protected http: HttpClient, protected endpoint: string) {}

  protected  get fullUrl(): string {
    return `${this.apiUrl}${this.endpoint}`;
  }

getAll<T>(): Observable<T> {
  return this.http.get<T>(this.fullUrl);
}


  getById<T>(id: number | string): Observable<T> {
    return this.http.get<T>(`${this.fullUrl}/${id}`).pipe(catchError(this.handleError));
  }

  create<T>(data: T): Observable<T> {
    return this.http.post<T>(this.fullUrl, data, { headers: this.headers })
      .pipe(catchError(this.handleError));
  }

  update<T>(id: number | string, data: T): Observable<T> {
    return this.http.put<T>(`${this.fullUrl}/${id}`, data, { headers: this.headers })
      .pipe(catchError(this.handleError));
  }

  delete(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.fullUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  protected handleError(error: HttpErrorResponse) {
    console.error('API error:', error);
    return throwError(() => new Error(error.message || 'Server error'));
  }
}
