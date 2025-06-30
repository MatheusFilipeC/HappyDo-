import { jsPDF } from 'jspdf';
import {
  Component,
  ElementRef,
  inject,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { UserGlobalService } from '../../../../Service/user-global.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ExpensesService } from '../../../../Service/expenses.service';
import { UserPaymentService } from '../../../../Service/user-payment.service';

import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-report-month-expense',
  imports: [
    CardModule,
    DialogModule,
    TooltipModule,
    ButtonModule,
    ChartModule,
    FormsModule,
    ReactiveFormsModule,
    DividerModule,
    CommonModule,
  ],
  templateUrl: './report-month-expense.component.html',
  styleUrl: './report-month-expense.component.css',
  providers: [ExpensesService, UserPaymentService],
})
export class ReportMonthExpenseComponent implements OnInit {
  @ViewChild('contentExpense', { static: false, read: ElementRef })
  el!: ElementRef;
  @Input() month!: string;
  expenses!: any[];

  userName!: string;
  userId!: number;
  userRole!: string;
  qtExpensesMonth: number = 0;
  totalExpense: number = 0;

  totalValueExpenseCategory!: any;
  valueTotalPaymente: number = 0;

  visible = false;

  category = ['ESSENCIAL', 'NAO_ESSENCIAL'];

  service = inject(ExpensesService);
  servicePayment = inject(UserPaymentService);

  constructor(private serviceUserGlobal: UserGlobalService) {}

  ngOnInit() {
    this.serviceUserGlobal.user$.subscribe((updatedUser) => {
      this.userName = updatedUser.nome;
      this.userId = updatedUser.usuarioId;
      this.userRole = updatedUser.role;
    });

    this.getPaymentUserTotal();
  }

  showDialog() {
    this.visible = true;
  }

  getPaymentUserTotal() {
    try {
      this.servicePayment.getTotalPayment(this.userId).subscribe({
        next: (value) => {
          this.valueTotalPaymente = value;
        },
        error: (err) => {
          console.error('Erro para carregar os dados ', err.error);
        },
      });
    } catch (error) {
      console.error('Error do Try Catch', error);
    }
  }

  getExpensesUser() {
    try {
      this.service.getListExpensesUser(this.userId).subscribe({
        next: (value) => {
          this.expenses = value.map((expense: any) => ({
            id: expense.id,
            titulo: expense.titulo,
            descricao: expense.descricao,
            categoria: expense.categoria,
            produto: expense.produto,
            valor: expense.valor,
            dataGasto: expense.dataGasto,
          }));

          const monthNumber = this.getMonthNumber(this.month);

          if (monthNumber === 0) {
            console.error('Mês inválido selecionado.');
            return;
          }

          const currentYear = new Date().getFullYear();

          const filteredExpenses = this.expenses.filter((expense) => {
            const [year, month, day] = expense.dataGasto.split('-').map(Number);
            const expenseDate = new Date(year, month - 1, day);

            return (
              expenseDate.getMonth() + 1 === monthNumber &&
              expenseDate.getFullYear() === currentYear
            );
          });

          this.expenses = filteredExpenses;

          this.qtExpensesMonth = this.expenses.length;

          this.totalExpense = this.expenses.reduce(
            (sum, expense) => sum + expense.valor,
            0
          );

          this.totalValueExpenseCategory = {
            ESSENCIAL:
              filteredExpenses
                .filter((e) => e.categoria === 'ESSENCIAL')
                .reduce((sum, e) => sum + e.valor, 0) || 0,
            NAO_ESSENCIAL:
              filteredExpenses
                .filter((e) => e.categoria === 'NAO_ESSENCIAL')
                .reduce((sum, e) => sum + e.valor, 0) || 0,
          };
        },
        error: (err) => {
          console.error('Erro para carregar os dados ', err.error);
        },
      });
    } catch (error) {
      console.error('Error do Try Catch', error);
    }
  }

  getMonthNumber(monthName: string): number {
    const months = [
      'Janeiro',
      'Fevereiro',
      'Março',
      'Abril',
      'Maio',
      'Junho',
      'Julho',
      'Agosto',
      'Setembro',
      'Outubro',
      'Novembro',
      'Dezembro',
    ];
    return months.indexOf(monthName) + 1;
  }

  formatValueCurrencyBR(valor: number): string {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
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
          pdf.save('relatorioPorPeriodoFinancas.pdf');
        },
      });
    }, 100);
  }
}
