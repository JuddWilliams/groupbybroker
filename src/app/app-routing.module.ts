import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.module').then((m) => m.TabsPageModule),
  },
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then((m) => m.LoginPageModule),
  },
  {
    path: 'create-user',
    loadChildren: () => import('./create-user/create-user.module').then((m) => m.CreateUserPageModule),
  },
  {
    path: 'reset-password',
    loadChildren: () => import('./reset-password/reset-password.module').then((m) => m.ResetPasswordPageModule),
  },
  {
    path: 'set-password',
    loadChildren: () => import('./set-password/set-password.module').then((m) => m.SetPasswordPageModule),
  },  {
    path: 'test-page',
    loadChildren: () => import('./test-page/test-page.module').then( m => m.TestPagePageModule)
  },
  {
    path: 'add-record-modal',
    loadChildren: () => import('./add-record-modal/add-record-modal.module').then( m => m.AddRecordModalPageModule)
  },

];
@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
