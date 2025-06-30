import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ListStatusTaskService {
  private readonly api = environment.API;
  constructor(private http: HttpClient) {}

  getListTaskStatusUser(userId: number): Observable<any> {
    return this.http.get<any>(`${this.api}api/${userId}/tarefas`);
  }
}
