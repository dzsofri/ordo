import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { LandingComponent } from './components/landing/landing.component';
import { TwofaComponent } from './components/twofa/twofa.component';
import { CalendarComponent } from './components/calendar/calendar.component';
import { CalendareventComponent } from './components/calendarevent/calendarevent.component';
import { EventdetailsComponent } from './components/eventdetails/eventdetails.component';

export const routes: Routes = [

  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'twofa',
    component: TwofaComponent,
  },
   {
    path: 'eventdetails',
    component: EventdetailsComponent,
  },
     {
    path: 'calendarevents',
    component: CalendareventComponent,
  },
   {
    path: 'calendar',
    component: CalendarComponent,
  },
  {
    path: '',
    redirectTo: 'landing',
    pathMatch: 'full'
  },
  {
    path: 'landing',
    loadComponent: () =>
      import('./components/landing/landing.component')
        .then(m => m.LandingComponent)
  }
];
