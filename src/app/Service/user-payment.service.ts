import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserPaymentService {
  private readonly api = environment.API;
  constructor(private http: HttpClient) {}

  postNewPayment(idUser: number, data: any): Observable<any> {
    return this.http.post<any>(`${this.api}mesada/${idUser}`, data);
  }

  getTotalPayment(idUser: number): Observable<any>{
    return this.http.get<any>(`${this.api}mesada/saldo/${idUser}`)
  }

  getPerformanceDashboard(idUser: number): Observable<any>{
    return this.http.get<any>(`${this.api}mesada/painel-desempenho/${idUser}`)
  }
}
