import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStateService } from '../auth-service';

interface RoleGuardOptions {
  onlyWhenLoggedOut?: boolean;
}

/**
 * Guard, ami autentikációt és/vagy role-okat is ellenőriz.
 * - Ha nincs roles -> csak bejelentkezést ellenőriz.
 * - Ha van roles -> szerepkör alapján enged.
 * - Ha onlyWhenLoggedOut -> csak kijelentkezett felhasználónak engedi.
 */
export function roleGuard(roles?: string[], options?: RoleGuardOptions): CanActivateFn {
  return () => {
    const auth = inject(AuthStateService);
    const router = inject(Router);

    const loggedIn = auth.isLoggedIn();

 /*   // ⛔ Csak kijelentkezett felhasználóknak szabad ide jönni
    if (options?.onlyWhenLoggedOut && loggedIn) {
      router.navigate(['/home']);
      alert("Be vagy jelentkezve")
      return false;
    }*/

    // ⛔ Bejelentkezés szükséges
    if (!loggedIn && !options?.onlyWhenLoggedOut) {
      router.navigate(['/login']);
      return false;
    }

    // ⛔ Szerepkör ellenőrzés
    if (roles && roles.length > 0) {
      const userRoles = auth.roles();
      const common = roles.filter(role => userRoles.includes(role));

      console.log('🔑 Szükséges:', roles);
      console.log('👤 Jelenlegi:', userRoles);
      console.log('✅ Közös:', common);

      if (common.length === 0) {
        console.warn('⛔ Nincs megfelelő jogosultság, átirányítás kezdőoldalra-ra');
        router.navigate(['/home']);
        return false;
      }
    }

    return true;
  };
}
