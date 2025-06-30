import { jsPDF } from 'jspdf';
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { UserGlobalService } from '../../../../Service/user-global.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TaskService } from '../../../../Service/task.service';

import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-report-task-month',
  imports: [
    CardModule,
    TooltipModule,
    ButtonModule,
    ChartModule,
    DialogModule,
    FormsModule,
    ReactiveFormsModule,
    DividerModule,
    CommonModule,
  ],
  templateUrl: './report-task-month.component.html',
  styleUrl: './report-task-month.component.css',
  providers: [TaskService],
})
export class ReportTaskMonthComponent implements OnInit {
  @ViewChild('contentMonth', { static: false, read: ElementRef })
  el!: ElementRef;
  @Input() dateStart!: string;
  @Input() dateEnd!: string;

  visible = false;

  userName!: string;
  userId!: number;
  taskDone: number = 0;
  taskMissing: number = 0;
  taskPerformance: number = 0;

  totalTask = 0;

  listFrequenceTask!: any;
  listStatusTask!: any;

  frequencias = ['MENSAL', 'SEMANAL', 'DIARIA', 'ESPORADICA'];

  constructor(
    private serviceUserGlobal: UserGlobalService,
    private serviceTask: TaskService
  ) {}
  ngOnInit() {
    this.serviceUserGlobal.user$.subscribe((updatedUser) => {
      this.userName = updatedUser.nome;
      this.userId = updatedUser.usuarioId;
    });

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

          this.listStatusTask = {
            CONCLUIDO: 0,
            ANDAMENTO: 0,
          };

          const [monthStart, yearStart] = this.dateStart.split('-').map(Number);
          const [monthEnd, yearEnd] = this.dateEnd.split('-').map(Number);

          const start = new Date(yearStart, monthStart - 1, 1); // Primeiro dia do mês
          const end = new Date(yearEnd, monthEnd, 0); // Último dia do mês

          const filteredTasks = value.filter((task: any) => {
            const taskStart = new Date(task.dataInicio);
            const taskEnd = new Date(task.dataFim);

            return taskStart <= end && taskEnd >= start;
          });

          this.totalTask = filteredTasks.length;

          let tarefasConcluidas = 0;
          let tarefasPendentes = 0;

          filteredTasks.forEach((task: any) => {
            if (task.frequencia in this.listFrequenceTask) {
              this.listFrequenceTask[task.frequencia] += 1;
            }

            if (task.status in this.listStatusTask) {
              this.listStatusTask[task.status] += 1;
            }

            if (task.status === 'CONCLUIDO') {
              tarefasConcluidas += 1;
            } else if (task.status === 'ANDAMENTO') {
              tarefasPendentes += 1;
            }
          });

          const totalTarefasPeriodo = tarefasConcluidas + tarefasPendentes;
          this.taskPerformance =
            totalTarefasPeriodo > 0
              ? (tarefasConcluidas / totalTarefasPeriodo) * 100
              : 0;

          this.taskDone = this.listStatusTask.CONCLUIDO;
          this.taskMissing = this.listStatusTask.ANDAMENTO;
        },
        error: (err) => {
          console.error('Erro para carregar os dados ', err.error);
        },
      });
    } catch (error) {
      console.error('Error do Try Catch', error);
    }
  }

  showDialog() {
    this.visible = true;
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
          pdf.save('relatorioPeriodoTarefas.pdf');
        },
      });
    }, 100);
  }
}
