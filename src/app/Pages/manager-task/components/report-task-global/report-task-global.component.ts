import { jsPDF } from 'jspdf';
import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { UserGlobalService } from '../../../../Service/user-global.service';
import { ListStatusTaskService } from '../../../../Service/list-status-task.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TaskService } from '../../../../Service/task.service';

import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-report-task-global',
  imports: [
    CardModule,
    DialogModule,
    ButtonModule,
    TooltipModule,
    ChartModule,
    FormsModule,
    ReactiveFormsModule,
    DividerModule,
    CommonModule,
  ],
  templateUrl: './report-task-global.component.html',
  styleUrl: './report-task-global.component.css',
  providers: [ListStatusTaskService, TaskService],
})
export class ReportTaskGlobalComponent implements OnInit {
  @ViewChild('content', { static: false, read: ElementRef }) el!: ElementRef;


  visible = false;

  userName!: string;
  userId!: number;
  taskDone: number = 0;
  taskMissing: number = 0;
  taskPerformance: number = 0;

  totalTask = 0;

  listFrequenceTask!: any;

  frequencias = ['MENSAL', 'SEMANAL', 'DIARIA', 'ESPORADICA'];

  constructor(
    private serviceUserGlobal: UserGlobalService,
    private service: ListStatusTaskService,
    private serviceTask: TaskService
  ) {}
  ngOnInit() {
    this.serviceUserGlobal.user$.subscribe((updatedUser) => {
      this.userName = updatedUser.nome;
      this.userId = updatedUser.usuarioId;
    });

    this.getOverviewTask();
    this.getTaskUser();
  }

  showDialog() {
    this.visible = true;
  }

  getOverviewTask() {
    try {
      this.service.getListTaskStatusUser(this.userId).subscribe({
        next: (value) => {
          this.taskDone = value.tarefasConcluidas;
          this.taskMissing = value.tarefasPendentes;

          const totalTasks = this.taskDone + this.taskMissing;
          this.taskPerformance =
            totalTasks > 0 ? (this.taskDone / totalTasks) * 100 : 0;
        },
        error: (err) => {
          console.error('Erro para login ', err.error);
        },
      });
    } catch (error) {
      console.error('Error do Try Catch', error);
    }
  }

  getTaskUser() {
    try {
      this.serviceTask.getTasks(this.userId).subscribe({
        next: (value) => {
          this.totalTask = value.length;

          this.listFrequenceTask = {
            DIARIA: 0,
            SEMANAL: 0,
            MENSAL: 0,
            ESPORADICA: 0,
          };

          value.forEach((task: any) => {
            if (task.frequencia in this.listFrequenceTask) {
              this.listFrequenceTask[task.frequencia] += 1;
            }
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

  reportPDFTask() {
    setTimeout(() => {
      if (!this.el || !this.el.nativeElement) {
        console.error('Elemento não encontrado!');
        return;
      }

      let pdf = new jsPDF('p', 'pt', 'a4');

      pdf.html(this.el.nativeElement, {
        callback: (pdf) => {
          pdf.save('relatorioGlobalTarefas.pdf');
        },
      });
    }, 100);
  }
}
