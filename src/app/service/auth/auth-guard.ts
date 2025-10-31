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

    // ⛔ Csak kijelentkezett felhasználóknak szabad ide jönni
    if (options?.onlyWhenLoggedOut && loggedIn) {
      alert('❗Ez az oldal csak kijelentkezett felhasználók számára érhető el.');
      router.navigate(['/home']);
      return false;
    }

    // ⛔ Bejelentkezés szükséges
    if (!loggedIn && !options?.onlyWhenLoggedOut) {
      alert('⚠️ Bejelentkezés szükséges az oldal eléréséhez!');
      router.navigate(['/login']);
      return false;
    }

    // ⛔ Szerepkör ellenőrzés
    if (roles && roles.length > 0) {
      const userRoles = auth.roles();
      const common = roles.filter(role => userRoles.includes(role));

      console.log('🔑 Szükséges szerepkörök:', roles);
      console.log('👤 Jelenlegi szerepkörök:', userRoles);
      console.log('✅ Közös szerepkörök:', common);

      if (common.length === 0) {
        alert('⛔ Nincs megfelelő jogosultságod ehhez az oldalhoz!');
        router.navigate(['/home']);
        return false;
      }
    }

    return true;
  };
}
