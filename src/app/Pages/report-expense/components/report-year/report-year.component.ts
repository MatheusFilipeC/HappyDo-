import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  inject,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ExpensesService } from '../../../../Service/expenses.service';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { UserGlobalService } from '../../../../Service/user-global.service';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-report-year',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    CardModule,
    DialogModule,
    DividerModule,
    ButtonModule,
  ],
  templateUrl: './report-year.component.html',
  styleUrl: './report-year.component.css',
  providers: [ExpensesService],
})
export class ReportYearComponent implements OnInit, OnChanges {
  @ViewChild('contentExpenseYear', { static: false, read: ElementRef })
  el!: ElementRef;

  @Input() year!: number;

  userName!: string;
  userId!: number;

  totalNaoEssencial = 0;
  totalEssencial = 0;
  totalAnual = 0;
  visible = false;
  service = inject(ExpensesService);

  constructor(private serviceUserGlobal: UserGlobalService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['year'] && this.year && this.userId) {
      this.getYearExpenseCategory();
    }
  }

  ngOnInit() {
    this.serviceUserGlobal.user$.subscribe((updatedUser) => {
      this.userName = updatedUser.nome;
      this.userId = updatedUser.usuarioId;
    });
  }

  getYearExpenseCategory() {
    try {
      this.service
        .getListYearCategoryTotalExpense(this.userId, this.year)
        .subscribe({
          next: (resp) => {
            console.log(resp);

            this.totalAnual = resp.totalAnual | 0;
            this.totalEssencial = resp.totalEssencial | 0;
            this.totalNaoEssencial = resp.totalNaoEssencial | 0;
          },
          error: (err) => {
            console.error('Erro para carregar os dados ', err.error);
          },
        });
    } catch (error) {
      console.error('Error do Try Catch', error);
    }
  }

  formatValueCurrencyBR(valor: number): string {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
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
          pdf.save('relatorioAnualFinancas.pdf');
        },
      });
    }, 100);
  }
}
