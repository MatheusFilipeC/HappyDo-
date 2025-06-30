import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { HttpClient } from '@angular/common/http';
import { PostUser } from '../Interface/postUser';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UpdateUserService {
  private readonly api = environment.API;
  constructor(private http: HttpClient) {}

  updateUser(userId: number, data: PostUser): Observable<any> {
    return this.http.put<any>(`${this.api}api/${userId}`, data);
  }
}
