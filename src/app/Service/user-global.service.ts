import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserGlobalService {
  private userSubject = new BehaviorSubject<any>(this.getUserFromStorage());
  user$ = this.userSubject.asObservable(); 

  constructor() {}

  private getUserFromStorage() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  updateUser(newUser: any) {
    localStorage.setItem('user', JSON.stringify(newUser)); 
    this.userSubject.next(newUser); 
  }
}
