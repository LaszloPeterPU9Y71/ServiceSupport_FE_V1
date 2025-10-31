import {Routes} from '@angular/router';
import {LoginComponent} from './login-component/login-component';
import {roleGuard} from './service/auth/auth-guard';
import {ResetPasswordComponent} from './reset-password-component/reset-password-component';
import {HomeComponent} from './home-component/home-component';
import {RegisterComponent} from './register-component/register-component';
import {OwnerCompanyEmployeeComponent} from './owner-company-employee-component/owner-company-employee-component';
import {OwnerCompanyComponent} from './owner-company-component/owner-company-component';
import {ToolComponent} from './tool-component/tool-component';
import {PartsComponent} from './parts-component/parts-component';
import {DefectsComponent} from './defects-component/defects-component';
import {CollaguesComponent} from './collague-component/collagues-component';

import {WorksheetComponent} from './worksheet-component/worksheet-component';
import WorksheetDetailsComponent from './worksheet-component/worksheet-details/worksheet-details';
import {WorksheetCreateComponent} from './worksheet-component/worksheet-create/workshet-create';



export const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [roleGuard(undefined, { onlyWhenLoggedOut: true })] },
  { path: 'reset-password', component: ResetPasswordComponent, canActivate: [roleGuard(undefined, { onlyWhenLoggedOut: true })] },

  { path: 'home', component:HomeComponent, canActivate: [roleGuard( undefined,{ onlyWhenLoggedOut: false})] },
  { path: 'registration', component: RegisterComponent, canActivate:  [roleGuard(['ROLE_ADMIN'])] },

  { path: 'owner-company-employee', component: OwnerCompanyEmployeeComponent, canActivate: [roleGuard()] },
  { path: 'owner-company', component: OwnerCompanyComponent, canActivate: [roleGuard()] },
  { path: 'tools', component: ToolComponent, canActivate: [roleGuard()] },
  { path: 'parts', component: PartsComponent, canActivate: [roleGuard()] },
  { path: 'defects', component: DefectsComponent, canActivate: [roleGuard()] },
  { path: 'collagues', component: CollaguesComponent, canActivate: [roleGuard(['ROLE_ADMIN'])] },

  { path: 'worksheet', component: WorksheetComponent, canActivate: [roleGuard()] },
  { path: 'worksheet/new', component: WorksheetCreateComponent, canActivate: [roleGuard()] },
  { path: 'worksheet/:id', component: WorksheetDetailsComponent, canActivate: [roleGuard()] },


  { path: '', redirectTo: 'home', pathMatch: 'full' }
];
