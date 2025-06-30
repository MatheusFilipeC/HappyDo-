import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private readonly api = environment.API;
  constructor(private http: HttpClient) {}

  getTasks(id: number): Observable<any> {
    return this.http.get<any>(`${this.api}tarefas/${id}`);
  }

  getTaskProgress(id: number): Observable<any> {
    return this.http.get<any>(`${this.api}tarefas/${id}/andamento`);
  }

  getTaskDone(id: number): Observable<any> {
    return this.http.get<any>(`${this.api}tarefas/${id}/concluido`);
  }

  getTaskOfDay(id: number): Observable<any> {
    return this.http.get<any>(`${this.api}tarefas/tarefas-do-dia/${id}`);
  }

  postTask(idCreator: number, idOwner: number, data: any): Observable<any> {
    return this.http.post<any>(
      `${this.api}tarefas/${idCreator}/${idOwner}`,
      data
    );
  }

  updateTask(idUser: number, idTask: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.api}tarefas/${idTask}/${idUser}`, data);
  }

  deleteTask(idTask: number, idUser: number): Observable<any> {
    return this.http.delete<any>(`${this.api}tarefas/${idTask}/${idUser}`);
  }
}
