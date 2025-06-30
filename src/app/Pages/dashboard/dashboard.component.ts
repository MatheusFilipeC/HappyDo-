import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { CardModule } from 'primeng/card';
import { MenuComponent } from '../../Components/menu/menu.component';
import { AvatarModule } from 'primeng/avatar';
import { DividerModule } from 'primeng/divider';
import { KnobModule } from 'primeng/knob';
import { FinanceComponent } from './components/finance/finance.component';
import { ListStatusTaskService } from '../../Service/list-status-task.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserGlobalService } from '../../Service/user-global.service';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { CarouselModule } from 'primeng/carousel';
import { UserPaymentService } from '../../Service/user-payment.service';

import { TabsModule } from 'primeng/tabs';
import { ButtonModule } from 'primeng/button';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TaskService } from '../../Service/task.service';
import { OrderListModule } from 'primeng/orderlist';
import { CheckTaskMenteeComponent } from './components/check-task-mentee/check-task-mentee.component';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TaskCheckService } from '../../Service/task-check.service';
import { SignalTask } from '../../Interface/signalTask';

import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-dashboard',
  imports: [
    MenuComponent,
    ConfirmDialogModule,
    ToastModule,
    CarouselModule,
    OrderListModule,
    ButtonModule,
    SelectButtonModule,
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    ChartModule,
    TabsModule,
    CardModule,
    AvatarModule,
    DividerModule,
    KnobModule,
    FinanceComponent,
    ResetPasswordComponent,
    CheckTaskMenteeComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  providers: [
    ListStatusTaskService,
    ConfirmationService,
    TaskCheckService,
    MessageService,
  ],
})
export class DashboardComponent implements OnInit {
  chartData: any;
  chartOptions: any;
  taskDone: number = 0;
  taskMissing: number = 0;
  taskPerformance: number = 0;
  userName!: string;
  valueKnob!: string;

  userId!: number;
  userRole!: string;
  firstAcess!: boolean;

  data!: any[];
  responsiveOptions: any[] | undefined;

  totalPoints!: number;
  donePoints!: number;
  donePercentage!: number;
  valueProportional!: number;
  valueAllowance!: number;

  value: number = 0;
  stateOptions!: any[];

  msgTask!: string;
  tasksDayUser: any[] = [];
  checkBtnToggle!: boolean;
  valueSignalDone!: SignalTask[];

  checkAllowance: boolean = false;
  msgAllowance!: string;

  checkAllSignalTaskUser: boolean = false;

  constructor(
    private service: ListStatusTaskService,
    private serviceUserGlobal: UserGlobalService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private serviceTaskCheck: TaskCheckService,
    private router: Router
  ) {}

  private servicePayment = inject(UserPaymentService);
  private serviceTask = inject(TaskService);

  @ViewChild(CheckTaskMenteeComponent)
  checkTaskMenteeComponent!: CheckTaskMenteeComponent;

  ngOnInit() {
    this.serviceUserGlobal.user$.subscribe((updatedUser) => {
      this.userName = updatedUser.nome;
      this.userId = updatedUser.usuarioId;
      this.userRole = updatedUser.role;
      this.firstAcess = updatedUser.primeiroAcesso;
    });

    try {
      this.service.getListTaskStatusUser(this.userId).subscribe({
        next: (value) => {
          this.taskDone = value.tarefasConcluidas;
          this.taskMissing = value.tarefasPendentes;

          const totalTasks = this.taskDone + this.taskMissing;
          this.taskPerformance =
            totalTasks > 0 ? (this.taskDone / totalTasks) * 100 : 0;

          this.chartData = {
            labels: ['Concluídas', 'Pendentes'],
            datasets: [
              {
                data: [this.taskDone, this.taskMissing],
                backgroundColor: ['#4caf50', '#f44336'],
                hoverBackgroundColor: ['#66bb6a', '#e57373'],
              },
            ],
          };
        },
        error: (err) => {
          console.error('Erro para login ', err.error);
        },
      });
    } catch (error) {
      console.error('Error do Try Catch', error);
    }

    this.chartOptions = {
      responsive: true,
      plugins: {
        legend: {
          display: true,
          position: 'right',
        },
      },
    };

    this.getPerformance(this.userId);

    this.responsiveOptions = [
      {
        breakpoint: '1400px',
        numVisible: 2,
        numScroll: 1,
      },
      {
        breakpoint: '1199px',
        numVisible: 3,
        numScroll: 1,
      },
      {
        breakpoint: '767px',
        numVisible: 2,
        numScroll: 1,
      },
      {
        breakpoint: '575px',
        numVisible: 1,
        numScroll: 1,
      },
    ];

    this.checkLabelButtonToggle();

    this.getTaskDay();
  }

  signalTask(item: any) {
    if (this.userRole == 'ADMIN') {
      this.confirmationService.confirm({
        target: item.target as EventTarget,
        message: 'Tem certeza que deseja concluír a tarefa?',
        header: 'Concluír tarefa',
        closable: false,
        closeOnEscape: true,
        icon: 'pi pi-exclamation-triangle',
        rejectButtonProps: {
          label: 'Cancelar',
          severity: 'secondary',
          outlined: true,
        },
        acceptButtonProps: {
          label: 'Confirmar',
        },
        accept: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Concluír tarefa',
            detail: 'Tarefa concluída com sucesso',
          });
          this.postCheckTaskUserAdmin(item.id, item.responsavelId, true);
        },
        reject: () => {
          this.messageService.add({
            severity: 'info',
            summary: 'Tarefa não concluída',
            detail: 'Sua tarefa não foi concluída',
            life: 3000,
          });
        },
      });
    } else {
      this.confirmationService.confirm({
        target: item.target as EventTarget,
        message:
          'Sinalizar tarefa para o mentor responsável aprovar a conclusão da tarefa!',
        header: 'Sinalizar tarefa como concluída',
        closable: false,
        closeOnEscape: true,
        icon: 'pi pi-exclamation-triangle',
        rejectButtonProps: {
          label: 'Cancelar',
          severity: 'secondary',
          outlined: true,
        },
        acceptButtonProps: {
          label: 'Sinalizar',
        },
        accept: () => {
          const valueSignalTask = true;
          this.valueSignalDone = [{ sinalizadaUsuario: valueSignalTask }];

          this.postTaskSignalDoneUser(
            item.id,
            item.responsavelId,
            this.valueSignalDone[0]
          );

          this.messageService.add({
            severity: 'success',
            summary: 'Tarefa sinalizada',
            detail: 'Tarefa sinalizada com sucesso',
          });
        },
        reject: () => {
          item.sinalizadaUsuario = false;
          this.messageService.add({
            severity: 'info',
            summary: 'Tarefa não sinalizada',
            detail: 'Sua tarefa não foi sinalizada',
            life: 3000,
          });
        },
      });
    }
  }

  postCheckTaskUserAdmin(idTask: number, idAdmin: number, data: boolean) {
    try {
      this.serviceTaskCheck
        .postAdminCheckTask(idTask, idAdmin, data)
        .subscribe({
          next: (value) => {
            window.location.reload();
          },
          error: (err) => {
            console.error('Error para sinalizar tarefa concluida', err);
          },
        });
    } catch (error) {
      console.error('Error no Try Catch', error);
    }
  }

  postTaskSignalDoneUser(idTask: number, idUser: number, data: any) {
    try {
      this.serviceTaskCheck.postSignalTask(idTask, idUser, data).subscribe({
        next: (value) => {
          window.location.reload();
        },
        error: (err) => {
          console.error('Error para sinalizar tarefa concluida', err);
        },
      });
    } catch (error) {
      console.error('Error no Try Catch', error);
    }
  }

  showDialogTaskMentee() {
    if (this.checkTaskMenteeComponent) {
      this.checkTaskMenteeComponent.showDialog();
    }
  }

  redirectURL(url: string) {
    this.router.navigateByUrl(`${url}`);
  }

  checkLabelButtonToggle() {
    if (this.userRole == 'USER') {
      this.stateOptions = [{ name: 'Tarefas do dia', value: 0 }];
      this.checkBtnToggle = true;
    } else {
      this.checkBtnToggle = false;
      this.stateOptions = [
        { name: 'Tarefas do dia', value: 0 },
        { name: 'Validar tarefas', value: 1 },
      ];
    }
  }


  getTaskDay() {
    try {
      this.serviceTask.getTaskOfDay(this.userId).subscribe({
        next: (tarefas) => {
          if (Array.isArray(tarefas) && tarefas.length > 0) {
            
            this.serviceTaskCheck.getTaskSignal(this.userId).subscribe({
              next: (sinalizadas) => {
                const idsParaOcultar = sinalizadas
                  .filter((t: any) => t.sinalizadaUsuario && !t.concluida)
                  .map((t: any) => t.tarefa); // `tarefa` é o id da tarefa

                this.tasksDayUser = tarefas.filter(
                  (task) => !idsParaOcultar.includes(task.id)
                );

                if (this.tasksDayUser.length == 0 && this.userRole == 'USER') {
                  this.checkAllSignalTaskUser = true;
                }
              },
              error: (err) => {
                console.error('Erro ao buscar tarefas sinalizadas', err);
                // fallback: exibe todas as tarefas se não conseguir filtrar
                this.tasksDayUser = tarefas;
              },
            });
          } else if (tarefas?.mensagem) {
            this.checkAllSignalTaskUser = false;
            this.msgTask = tarefas.mensagem;
          } else {
            console.log('Sem dados.');
          }
        },
        error: (err) => {
          console.error('Erro para carregar tarefas do dia ', err.error);
        },
      });
    } catch (error) {
      console.error('Error do Try Catch', error);
    }
  }

  formatDate(date: string): string {
    if (!date) return '';

    const [year, month, day] = date.split('-');

    return `${day}-${month}-${year}`;
  }

  getPerformance(id: number) {
    try {
      this.servicePayment.getPerformanceDashboard(id).subscribe({
        next: (value) => {
          this.valueAllowance = value.valor;
          this.totalPoints = value.totalPontosPeriodo;
          this.donePoints = value.pontosConcluidos;
          this.donePercentage = parseFloat(
            value.percentualConclusao.toFixed(2)
          );
          this.valueProportional = value.valorProporcional;
          this.data = [
            {
              name: 'Mesada disponível no mês',
              price: this.formatValueCurrencyBR(this.valueAllowance),
              icon: 'pi pi-money-bill',
              bgColor: 'bg-green-500',
            },
            {
              name: 'Total de pontos possíveis no período',
              price: this.totalPoints,
              icon: 'pi pi-sort-amount-up-alt',
              bgColor: 'bg-purple-500',
            },
            {
              name: 'Pontos acumulados até o momento',
              price: this.donePoints,
              icon: 'pi pi-caret-up',
              bgColor: 'bg-blue-500',
            },
            {
              name: 'Porcentagem de conclusão',
              price: this.donePercentage,
              icon: 'pi pi-percentage',
              bgColor: 'bg-black',
            },
            {
              name: 'Mesada proporcional',
              price: this.formatValueCurrencyBR(this.valueProportional),
              icon: 'pi pi-wallet',
              bgColor: 'bg-blue-500',
            },
          ];
        },
        error: (err) => {
          console.error('Erro para carregar os dados do painel ', err.error);
          this.totalPoints = 0;
          this.donePoints = 0;
          this.donePercentage = 0.0;
          this.valueProportional = 0;
          this.checkAllowance = true;
          this.msgAllowance = err.error.message;
          this.data = [
            {
              name: 'Mesada disponível no mês',
              price: this.formatValueCurrencyBR(this.valueAllowance),
              icon: 'pi pi-money-bill',
              bgColor: 'bg-green-500',
            },
            {
              name: 'Total de pontos possíveis no período',
              price: this.totalPoints,
              icon: 'pi pi-sort-amount-up-alt',
              bgColor: 'bg-purple-500',
            },
            {
              name: 'Pontos acumulados até o momento',
              price: this.donePoints,
              icon: 'pi pi-caret-up',
              bgColor: 'bg-blue-500',
            },
            {
              name: 'Porcentagem de conclusão',
              price: this.donePercentage,
              icon: 'pi pi-percentage',
              bgColor: 'bg-black',
            },
            {
              name: 'Mesada proporcional',
              price: this.formatValueCurrencyBR(this.valueProportional),
              icon: 'pi pi-wallet',
              bgColor: 'bg-blue-500',
            },
          ];
        },
      });
    } catch (error) {
      console.error('Error do Try Catch', error);
    }
  }

  formatValueCurrencyBR(valor: number): string {
    if (valor === undefined || valor === null) {
      return 'R$ 0,00';
    }
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }
}
