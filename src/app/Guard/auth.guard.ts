import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const localStorageEmail = localStorage.getItem('emailUser');
  
  if (localStorageEmail) {
    return true; 
  }

  router.navigate(['/login']);
  return false;
};
