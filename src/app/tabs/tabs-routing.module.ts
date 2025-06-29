import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';
import { AuthGuard } from '../auth.guard';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'tabAbout',
        loadChildren: () => import('../tabAbout/tabAbout.module').then(m => m.TabAboutPageModule)
      },
      {
        path: 'tabSearch',
        loadChildren: () => import('../tabSearch/tabSearch.module').then(m => m.TabSearchPageModule),
       // canActivate: [AuthGuard] // Protected route
      },
      {
        path: 'tabDashboard',
        loadChildren: () => import('../tabDashboard/tabDashboard.module').then(m => m.TabDashboardPageModule),
        canActivate: [AuthGuard] // Protected route
      },
      {
        path: 'tab3',
        loadChildren: () => import('../tab3/tab3.module').then(m => m.Tab3PageModule),
        canActivate: [AuthGuard] // Protected route
      },
      { // !!! Default route for tabs !!!
        path: '', 
        redirectTo: '/tabs/tabSearch',
        //redirectTo: '/tabs/tabAbout',
        pathMatch: 'full'
      }
    ]
  },
  {// !!! Default route for tabs !!!
    path: '',
    redirectTo: '/tabs/tabSearch',
    //redirectTo: '/tabs/tabAbout',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class TabsPageRoutingModule {}
