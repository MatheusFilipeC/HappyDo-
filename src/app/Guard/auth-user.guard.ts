import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authUserGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const localStorageUser = localStorage.getItem('user');

  if (localStorageUser) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};
