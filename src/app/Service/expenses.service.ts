import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ExpensesService {
  private readonly api = environment.API;
  constructor(private http: HttpClient) {}

  getListExpensesUser(userId: number): Observable<any> {
    return this.http.get<any>(`${this.api}gasto/${userId}/gastos`);
  }

  getExpensesTotal(userId: number): Observable<any> {
    return this.http.get<any>(`${this.api}gasto/${userId}/gastos/total`);
  }

  getResultTotalExpenseCategory(userId: number): Observable<any> {
    return this.http.get<any>(
      `${this.api}gasto/${userId}/gastos/total/categoria`
    );
  }

  getListMonthCategoryTotalExpense(userId: number): Observable<any> {
    return this.http.get<any>(
      `${this.api}gasto/${userId}/gastos/categoria/mensal`
    );
  }

  getListYearCategoryTotalExpense(
    userId: number,
    year: number
  ): Observable<any> {
    return this.http.get<any>(
      `${this.api}gasto/${userId}/gastos/categoria/anual/${year}`
    );
  }

  postAddExpenses(idUser: number, data: any): Observable<any> {
    return this.http.post<any>(`${this.api}gasto/${idUser}/registro`, data);
  }

  deleteExpense(idExpense: number): Observable<any> {
    return this.http.delete<any>(`${this.api}gasto/${idExpense}`);
  }
}
