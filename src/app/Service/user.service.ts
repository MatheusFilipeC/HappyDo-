import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly api = environment.API;
  constructor(private http: HttpClient) {}

  getMeentFromAdmin(idAdmin: number): Observable<any> {
    return this.http.get<any>(`${this.api}api/${idAdmin}/mentorados`);
  }

  getUserById(idUser: number): Observable<any> {
    return this.http.get<any>(`${this.api}api/${idUser}`);
  }

  postNewMentee(idAdmin: number, data: any): Observable<any> {
    return this.http.post<any>(`${this.api}api/${idAdmin}/mentorados`, data);
  }

  deleteMentee(id: number): Observable<any> {
    return this.http.delete(`${this.api}api/${id}`);
  }
}
