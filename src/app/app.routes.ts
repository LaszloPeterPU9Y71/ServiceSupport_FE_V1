import {Routes} from '@angular/router';
import {LoginComponent} from './login-component/login-component';
import {roleGuard} from './service/auth/auth-guard';
import {ResetPasswordComponent} from './reset-password-component/reset-password-component';
import {HomeComponent} from './home-component/home-component';
import {RegisterComponent} from './register-component/register-component';
import {OwnerCompanyEmployeeComponent} from './owner-company-employee-component/owner-company-employee-component.html';
import {OwnerCompanyComponent} from './owner-company-component/owner-company-component';


export const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [roleGuard(undefined, { onlyWhenLoggedOut: true })] },
  { path: 'reset-password', component: ResetPasswordComponent, canActivate: [roleGuard(undefined, { onlyWhenLoggedOut: true })] },

  { path: 'home', component:HomeComponent, canActivate: [roleGuard( undefined,{ onlyWhenLoggedOut: false})] },
  { path: 'registration', component: RegisterComponent, canActivate: [roleGuard(undefined, { onlyWhenLoggedOut: false })] },

 // { path: 'owner-company-employee', component: OwnerCompanyEmployeeComponent, canActivate: [roleGuard()] },
  { path: 'owner-company', component: OwnerCompanyComponent, canActivate: [roleGuard()] },

  { path: '', redirectTo: 'home', pathMatch: 'full' }
];
