import { Routes } from '@angular/router';
import { LoginComponent } from './Pages/login/login.component';
import { RegisterComponent } from './Pages/register/register.component';
import { CheckEmailComponent } from './Pages/check-email/check-email.component';
import { RedefinirComponent } from './Pages/redefinir/redefinir.component';
import { authGuard } from './Guard/auth.guard';
import { DashboardComponent } from './Pages/dashboard/dashboard.component';
import { TaskComponent } from './Pages/task/task.component';
import { ManagerTaskComponent } from './Pages/manager-task/manager-task.component';
import { ExpensesComponent } from './Pages/expenses/expenses.component';
import { ReportExpenseComponent } from './Pages/report-expense/report-expense.component';
import { MenteeComponent } from './Pages/mentee/mentee.component';
import { MenteeTaskComponent } from './Pages/mentee-task/mentee-task.component';
import { ListMenteeTaskComponent } from './Pages/list-mentee-task/list-mentee-task.component';
import { authUserGuard } from './Guard/auth-user.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'check-email', component: CheckEmailComponent },
  {
    path: 'redefinir',
    component: RedefinirComponent,
    canActivate: [authGuard],
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authUserGuard],
  },
  { path: 'tarefas', component: TaskComponent, canActivate: [authUserGuard] },
  {
    path: 'gerenciar-tarefas',
    component: ManagerTaskComponent,
    canActivate: [authUserGuard],
  },
  {
    path: 'gastos',
    component: ExpensesComponent,
    canActivate: [authUserGuard],
  },
  {
    path: 'relatorio-gastos',
    component: ReportExpenseComponent,
    canActivate: [authUserGuard],
  },
  {
    path: 'mentoria',
    component: MenteeComponent,
    canActivate: [authUserGuard],
  },
  {
    path: 'tarefas-mentorados',
    component: MenteeTaskComponent,
    canActivate: [authUserGuard],
  },
  {
    path: 'lista-tarefas-mentorados',
    component: ListMenteeTaskComponent,
    canActivate: [authUserGuard],
  },
  { path: '**', redirectTo: '/login' },
];
