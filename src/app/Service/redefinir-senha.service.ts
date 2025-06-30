import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RedefinirSenhaService {
  private readonly api = environment.API;
  constructor(private http: HttpClient) {}

  postCheckEmail(data: any): Observable<string> {
    return this.http.post(`${this.api}api/esqueci-senha`, data, { responseType: 'text' });
  }

  postUpdatePassword(data: any): Observable<string> {
    return this.http.post(`${this.api}api/redefinir-senha`, data, { responseType: 'text' });
  }
}
