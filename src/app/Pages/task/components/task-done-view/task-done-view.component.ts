import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { DataViewModule } from 'primeng/dataview';
import { ConfirmationService, MessageService, SelectItem } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { SelectModule } from 'primeng/select';
import { Tag } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TaskService } from '../../../../Service/task.service';
import { TaskCheckService } from '../../../../Service/task-check.service';
import { UserGlobalService } from '../../../../Service/user-global.service';

@Component({
  selector: 'app-task-done-view',
  imports: [
    DataViewModule,
    ButtonModule,
    ToggleSwitchModule,
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    Tag,
    ScrollPanelModule,
    SelectModule,
    ConfirmDialogModule,
    ToastModule,
  ],

  templateUrl: './task-done-view.component.html',
  styleUrl: './task-done-view.component.css',
  providers: [
    ConfirmationService,
    MessageService,
    TaskService,
    TaskCheckService,
  ],
})
export class TaskDoneViewComponent implements OnInit {
  @Output() refreshList = new EventEmitter<void>();
  sortOrder!: number;
  sortOptions!: SelectItem[];
  sortField!: string;
  tasksDone: any[] = [];
  allTaksDone: any[] = [];
  userId!: number;
  userRole!: string;

  constructor(
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private service: TaskService,
    private serviceTaskCheck: TaskCheckService,
    private serviceUserGlobal: UserGlobalService
  ) {}

  ngOnInit() {
    this.serviceUserGlobal.user$.subscribe((updatedUser) => {
      this.userId = updatedUser.usuarioId;
      this.userRole = updatedUser.role;
    });

    this.sortOptions = [
      { label: 'DIARIA', value: 'DIARIA' },
      { label: 'SEMANAL', value: 'SEMANAL' },
      { label: 'MENSAL', value: 'MENSAL' },
      { label: 'ESPORÁDICO', value: 'ESPORÁDICO' },
      { label: 'TODAS', value: 'TODAS' },
    ];

    this.getDoneTaskUser();
  }

  getDoneTaskUser() {
    try {
      this.service.getTaskDone(this.userId).subscribe({
        next: (value) => {
          this.refreshList.emit();

          this.serviceTaskCheck.getTaskSignal(this.userId).subscribe({
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

              this.allTaksDone = value.map((task: any) => ({
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

              this.tasksDone = [...this.allTaksDone];
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

  onSortChangeTaskDone(event: any) {
    const selectedFrequencia = event.value;

    if (selectedFrequencia === 'TODAS') {
      this.tasksDone = [...this.allTaksDone];
    } else {
      this.tasksDone = this.allTaksDone.filter(
        (task) => task.frequencia === selectedFrequencia
      );
    }
  }

  formatDate(date: string): string {
    if (!date) return '';
    const [year, month, day] = date.split('-');

    return `${day}-${month}-${year}`;
  }

  deleteTaskUser(idTask: number) {
    try {
      this.service.deleteTask(idTask, this.userId).subscribe({
        next: (value) => {
          this.getDoneTaskUser();
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
