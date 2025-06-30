import { Component, OnInit, ViewChild } from '@angular/core';
import { CardModule } from 'primeng/card';
import { MenuComponent } from '../../Components/menu/menu.component';
import { OrderListModule } from 'primeng/orderlist';
import { SelectModule } from 'primeng/select';
import { Select } from 'primeng/select';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { Tag } from 'primeng/tag';
import { UserService } from '../../Service/user.service';
import { UserGlobalService } from '../../Service/user-global.service';
import { ListMentee } from '../../Interface/list-mentee';
import { TaskService } from '../../Service/task.service';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TaskCheckService } from '../../Service/task-check.service';
import { ToggleButtonModule } from 'primeng/togglebutton';
import {
  FormsModule,
  Validators,
  FormGroup,
  FormBuilder,
  ReactiveFormsModule,
} from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';

import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { UpdateTaskMenteeComponent } from './components/update-task-mentee/update-task-mentee.component';

@Component({
  selector: 'app-list-mentee-task',
  imports: [
    MenuComponent,
    ToggleSwitchModule,
    ToastModule,
    ButtonModule,
    ConfirmDialogModule,
    FormsModule,
    ReactiveFormsModule,
    CardModule,
    OrderListModule,
    ToggleButtonModule,
    Tag,
    CommonModule,
    SelectModule,
    Select,
    UpdateTaskMenteeComponent,
  ],
  templateUrl: './list-mentee-task.component.html',
  styleUrl: './list-mentee-task.component.css',
  providers: [
    UserService,
    TaskService,
    TaskCheckService,
    ConfirmationService,
    MessageService,
  ],
})
export class ListMenteeTaskComponent implements OnInit {
  products!: any[];
  userId!: number;
  userMentee: any[] = [];
  nameMentee: ListMentee[] = [];

  @ViewChild(UpdateTaskMenteeComponent)
  updateTaskMenteeComponent!: UpdateTaskMenteeComponent;

  constructor(
    private service: UserService,
    private confirmationService: ConfirmationService,
    private serviceTask: TaskService,
    private messageService: MessageService,
    private serviceTaskCheck: TaskCheckService,
    private serviceUserGlobal: UserGlobalService
  ) {}

  ngOnInit() {
    this.serviceUserGlobal.user$.subscribe((updatedUser) => {
      this.userId = updatedUser.usuarioId;
    });

    this.getMentee();
  }

  getMentee() {
    try {
      this.service.getMeentFromAdmin(this.userId).subscribe({
        next: (value) => {
          this.userMentee = value.map((data: any) => ({
            id: data.usuarioId,
            email: data.email,
            nome: data.nome,
            role: data.role,
            tarefasConcluidas: data.tarefasConcluidas,
            tarefasPendentes: data.tarefasPendentes,
          }));

          this.nameMentee = value.map((data: any) => ({
            mentee: data.nome,
            id: data.usuarioId,
          }));
        },
        error: (err) => {
          console.error('Erro para carregar os dados ', err.error);
        },
      });
    } catch (error) {
      console.error('Error do Try Catch', error);
    }
  }

  onMenteeSelect(value: any) {
    if (value != null) {
      this.getTaskMentee(value.id);
    } else {
      this.products = [];
    }
  }

  getTaskMentee(id: number) {
    try {
      this.serviceTask.getTasks(id).subscribe({
        next: (value) => {
          this.serviceTaskCheck.getTaskSignal(id).subscribe({
            next: (signalTasks) => {
              const signalMap = new Map(
                signalTasks.map((task: any) => [
                  task.tarefa,
                  task.sinalizadaUsuario,
                ])
              );

              const doneMap = new Map(
                signalTasks.map((task: any) => [task.tarefa, task.concluida])
              );

              const idTarefaCheckMap = new Map(
                signalTasks.map((task: any) => [task.tarefa, task.id])
              );

              this.products = value.map((task: any) => ({
                id: task.id,
                idTarefaCheck: idTarefaCheckMap.get(task.id),
                responsavelId: task.responsavelId,
                status: task.status,
                titulo: task.titulo,
                descricao: task.descricao,
                categoria: task.categoria,
                pontuacao: task.pontuacao,
                frequencia: task.frequencia,
                dataInicio: this.formatDate(task.dataInicio),
                dataFim: this.formatDate(task.dataFim),
                diasSemana: task.diasSemana,
                checked: false,
                deleteTask: false,
                sinalizadaUsuario: signalMap.get(task.id) ?? false,
                done: doneMap.get(task.id) ?? false,
              }));
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

  doneTaskMentee(item: any) {
    this.confirmationService.confirm({
      target: item.target as EventTarget,
      message: 'Aprovar tarefa como concluída do mentorado?',
      header: 'Concluir tarefa',
      closable: false,
      closeOnEscape: true,
      icon: 'pi pi-check-square',
      rejectButtonProps: {
        label: 'Cancelar',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Concluir',
      },
      accept: () => {
        this.putTaskDone(item.idTarefaCheck, item.done);
        this.messageService.add({
          severity: 'success',
          summary: 'Tarefa concluída',
          detail: 'Tarefa concluída com sucesso',
        });
      },
      reject: () => {
        item.done = false;
        this.messageService.add({
          severity: 'info',
          summary: 'Tarefa não concluída',
          detail: 'Tarefa não foi concluída',
          life: 3000,
        });
      },
    });
  }

  putTaskDone(idTaskCheck: number, data: boolean) {
    try {
      this.serviceTaskCheck
        .putDoneCheckMentee(idTaskCheck, this.userId, data)
        .subscribe({
          next: (value) => {},
          error: (err) => {
            console.error('Erro para concluir tarefa ', err.error);
          },
        });
    } catch (error) {
      console.error('Error do Try Catch', error);
    }
  }

  deleteTaskMentee(item: any) {
    this.confirmationService.confirm({
      target: item.target as EventTarget,
      message: 'Deseja realmente excluir essa tarefa?',
      header: 'Excluir tarefa',
      closable: false,
      closeOnEscape: true,
      icon: 'pi pi-trash',
      rejectButtonProps: {
        label: 'Cancelar',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Excluir',
        severity: 'danger',
      },
      accept: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Tarefa Excluida',
          detail: 'Tarefa excluída com sucesso',
        });
        this.deleteTaskUserMentee(item.id, item.responsavelId);
      },
      reject: () => {
        this.messageService.add({
          severity: 'info',
          summary: 'Tarefa não foi excluída',
          detail: 'Tarefa do mentorado não foi excluída',
          life: 3000,
        });
      },
    });
  }

  deleteTaskUserMentee(idTask: number, idUserMentee: number) {
    try {
      this.serviceTask.deleteTask(idTask, this.userId).subscribe({
        next: (value) => {
          this.getTaskMentee(idUserMentee);
        },
        error: (err) => {
          console.error('Erro para excluir tarefa ', err.error);
        },
      });
    } catch (error) {
      console.error('Error do Try Catch', error);
    }
  }

  updateTaskMentee(item: any) {
    if (this.updateTaskMenteeComponent) {
      this.updateTaskMenteeComponent.showDialogUpdateMentee(item);
    }
  }

  putTaskUpdateMentee(item: any) {
    this.getTaskMentee(item);
  }
}
