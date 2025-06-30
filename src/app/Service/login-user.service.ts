import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { HttpClient } from '@angular/common/http';
import { LoginUser } from '../Interface/loginUser';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoginUserService {
  private readonly api = environment.API;
  constructor(private http: HttpClient) {}

  postLogin(data: LoginUser): Observable<any> {
    return this.http.post<LoginUser>(`${this.api}api/login`, data);
  }

  postLoginMentee(data: string): Observable<any> {
    return this.http.post<any>(`${this.api}api/login/mentorado`, data);
  }
}
