import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TaskCheckService {
  private readonly api = environment.API;
  constructor(private http: HttpClient) {}

  getTaskSignal(idUser: number): Observable<any> {
    return this.http.get<any>(
      `${this.api}tarefas-data/tarefa-sinalizada/${idUser}`
    );
  }

  postSignalTask(idTask: number, idUser: number, data: any): Observable<any> {
    return this.http.post<any>(
      `${this.api}tarefas-data/${idTask}/sinalizar/${idUser}`,
      data
    );
  }

  putDoneCheckMentee(
    idTaskCheck: number,
    idAdmin: number,
    data: boolean
  ): Observable<any> {
    return this.http.put<any>(
      `${this.api}tarefas-data/${idTaskCheck}/confirmar/${idAdmin}/${data}`,
      null
    );
  }

  postAdminCheckTask(
    idTask: number,
    idAdmin: number,
    data: boolean
  ): Observable<any> {
    return this.http.post<any>(
      `${this.api}tarefas-data/${idTask}/concluir/${idAdmin}/${data}`,
      null
    );
  }
}
