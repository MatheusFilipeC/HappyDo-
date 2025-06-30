import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PostUser } from '../Interface/postUser';

@Injectable({
  providedIn: 'root',
})
export class CadastroService {
  private readonly api = environment.API;
  constructor(private http: HttpClient) {}

  postRegister(data: PostUser): Observable<any> {
    return this.http.post<PostUser>(`${this.api}api/usuarios`, data);
  }
}
