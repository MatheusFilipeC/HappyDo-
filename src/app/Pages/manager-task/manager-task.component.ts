import { Component, OnInit, ViewChild } from '@angular/core';
import { MenuComponent } from '../../Components/menu/menu.component';
import { CardModule } from 'primeng/card';
import { OrderListModule } from 'primeng/orderlist';
import {
  FormsModule,
  Validators,
  FormGroup,
  FormBuilder,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Tag } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { FloatLabel } from 'primeng/floatlabel';
import { DividerModule } from 'primeng/divider';
import { TaskService } from '../../Service/task.service';
import { UserGlobalService } from '../../Service/user-global.service';
import { ReportTaskGlobalComponent } from './components/report-task-global/report-task-global.component';
import { ReportTaskMonthComponent } from './components/report-task-month/report-task-month.component';
import { UpdateTaskComponent } from '../task/components/update-task/update-task.component';
import { TaskCheckService } from '../../Service/task-check.service';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-manager-task',
  imports: [
    MenuComponent,
    DatePickerModule,
    ToastModule,
    ButtonModule,
    DividerModule,
    CardModule,
    FloatLabel,
    Tag,
    OrderListModule,
    ConfirmDialogModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    ReportTaskGlobalComponent,
    ReportTaskMonthComponent,
    UpdateTaskComponent,
  ],
  templateUrl: './manager-task.component.html',
  styleUrl: './manager-task.component.css',
  providers: [
    TaskService,
    TaskCheckService,
    ConfirmationService,
    MessageService,
  ],
})
export class ManagerTaskComponent implements OnInit {
  products!: any[];
  startDate: any;
  endDate: any;
  userId!: number;
  registerForm!: FormGroup;
  loading: boolean = false;
  userRole!: string;

  dateStartSelected!: string;
  dateEndSelected!: string;
  allProducts: any[] = [];

  visibleUpdate: boolean = false;

  classError = ['w-full', 'ng-dirty', 'ng-invalid'];
  class = ['w-full'];

  @ViewChild(ReportTaskGlobalComponent)
  reportExpenseComponent!: ReportTaskGlobalComponent;

  @ViewChild(ReportTaskMonthComponent)
  reportTaskMonthComponent!: ReportTaskMonthComponent;

  @ViewChild(UpdateTaskComponent) updateTaskComponent!: UpdateTaskComponent;

  constructor(
    private service: TaskService,
    private serviceTaskCheck: TaskCheckService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private serviceUserGlobal: UserGlobalService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.serviceUserGlobal.user$.subscribe((updatedUser) => {
      this.userId = updatedUser.usuarioId;
      this.userRole = updatedUser.role;
    });

    this.registerForm = this.fb.group({
      dataInicio: ['', [Validators.required]],
      dataFim: ['', [Validators.required]],
    });

    this.getTaskUser();
  }

  getTaskUser() {
    try {
      // this.service.getTasks(this.userId).subscribe({
      //   next: (value) => {

      //     console.log(value);
      //     this.products = value.map((task: any) => ({
      //       id: task.id,
      //       responsavelId: task.responsavelId,
      //       status: task.status,
      //       titulo: task.titulo,
      //       descricao: task.descricao,
      //       categoria: task.categoria,
      //       frequencia: task.frequencia,
      //       dataInicio: this.formatDate(task.dataInicio),
      //       dataFim: this.formatDate(task.dataFim),
      //       diasSemana: task.diasSemana,
      //       checked: false,
      //       deleteTask: false,
      //     }));
      //   },
      //   error: (err) => {
      //     console.error('Erro para carregar os dados ', err.error);
      //   },
      // });

      this.service.getTasks(this.userId).subscribe({
        next: (value) => {
          this.serviceTaskCheck.getTaskSignal(this.userId).subscribe({
            next: (signalTasks) => {
              console.log(signalTasks);

              const signalMap = new Map(
                signalTasks.map((task: any) => [
                  task.tarefa,
                  task.sinalizadaUsuario,
                ])
              );
              const doneMap = new Map(
                signalTasks.map((task: any) => [task.tarefa, task.concluida])
              );

              this.allProducts = value.map((task: any) => ({
                id: task.id,
                responsavelId: task.responsavelId,
                status: task.status,
                titulo: task.titulo,
                descricao: task.descricao,
                taskConfirmadaAdmin: false,
                categoria: task.categoria,
                frequencia: task.frequencia,
                dataInicio: this.formatDate(task.dataInicio),
                dataFim: this.formatDate(task.dataFim),
                diasSemana: task.diasSemana,
                checked: false,
                deleteTask: false,
                sinalizadaUsuario: signalMap.get(task.id) ?? false,
                done: doneMap.get(task.id) ?? false,
              }));

              this.products = [...this.allProducts];
            },
          });
        },
        error: (err) => {
          console.error('Erro para carregar os dados ', err.error);
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

  downloadGlobalPDF() {
    this.reportExpenseComponent.showDialog();
  }

  onReportTaskMonth() {
    const formData = { ...this.registerForm.value };
    formData.dataInicio = this.formatDateForReport(formData.dataInicio);
    formData.dataFim = this.formatDateForReport(formData.dataFim);

    this.dateStartSelected = formData.dataInicio;
    this.dateEndSelected = formData.dataFim;

    this.reportTaskMonthComponent.getTaskUser();
    this.reportTaskMonthComponent.showDialog();

    this.registerForm.reset();
  }

  formatDateForReport(date: Date): string {
    if (!date) return '';

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');

    return `${month}-${year}`;
  }

  openModalUpdateTask(item: any) {
    console.log(item);
    if (this.updateTaskComponent) {
      this.updateTaskComponent.showDialog(item);
      this.visibleUpdate = true;
    }
  }

  deleteTaskUser(idTask: number) {
    try {
      this.service.deleteTask(idTask, this.userId).subscribe({
        next: (value) => {
          this.getTaskUser();
        },
        error: (err) => {
          console.error('Erro para deletar tarefa ', err.error);
        },
      });
    } catch (error) {
      console.error('Error do Try Catch', error);
    }
  }

  deleteTask(item: any) {
    this.confirmationService.confirm({
      target: item.target as EventTarget,
      message: 'Você tem certeza que deseja excluir essa tarefa',
      header: 'Deletar tarefa',
      icon: 'pi pi-info-circle',
      rejectButtonProps: {
        label: 'Cancelar',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Deletar',
        severity: 'danger',
      },
      accept: () => {
        this.deleteTaskUser(item.id);
        this.messageService.add({
          severity: 'success',
          summary: 'Tarefa excluída',
          detail: 'Sua tarefa foi excluída com sucesso',
          life: 3000,
        });
      },
      reject: () => {
        this.messageService.add({
          severity: 'info',
          summary: 'Tarefa',
          detail: 'Sua tarefa não foi excluída',
          life: 3000,
        });
      },
    });
  }
}
