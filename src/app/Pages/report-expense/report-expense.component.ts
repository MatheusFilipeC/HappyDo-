import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { MenuComponent } from '../../Components/menu/menu.component';
import { CardModule } from 'primeng/card';
import { OrderListModule } from 'primeng/orderlist';
import { CommonModule } from '@angular/common';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import {
  FormsModule,
  Validators,
  FormGroup,
  FormBuilder,
  ReactiveFormsModule,
} from '@angular/forms';
import { ReportMonth } from '../../Interface/reportMonth';
import { UserGlobalService } from '../../Service/user-global.service';
import { ExpensesService } from '../../Service/expenses.service';
import { ReportMonthExpenseComponent } from './components/report-month-expense/report-month-expense.component';
import { ReportYear } from '../../Interface/reportYear';

import { TabsModule } from 'primeng/tabs';
import { ReportYearComponent } from './components/report-year/report-year.component';

@Component({
  selector: 'app-report-expense',
  imports: [
    MenuComponent,
    DividerModule,
    CardModule,
    SelectModule,
    TabsModule,
    ButtonModule,
    OrderListModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ReportMonthExpenseComponent,
    ReportYearComponent,
  ],
  templateUrl: './report-expense.component.html',
  styleUrl: './report-expense.component.css',
  providers: [ExpensesService],
})
export class ReportExpenseComponent implements OnInit {
  @ViewChild(ReportMonthExpenseComponent)
  reportMonthExpenseComponent!: ReportMonthExpenseComponent;

  @ViewChild(ReportYearComponent)
  reportYearComponent!: ReportYearComponent;

  registerForm!: FormGroup;
  registerFormYear!: FormGroup;
  expenses!: any[];
  chooseMonth: ReportMonth[] = [];
  chooseYear: ReportYear[] = [];
  userId!: number;
  monthSelected!: string;
  yearSelected!: number;

  service = inject(ExpensesService);

  classError = ['w-full', 'ng-dirty', 'ng-invalid'];
  class = ['w-full'];

  constructor(
    private fb: FormBuilder,
    private serviceUserGlobal: UserGlobalService
  ) {}

  ngOnInit() {
    this.serviceUserGlobal.user$.subscribe((updatedUser) => {
      this.userId = updatedUser.usuarioId;
    });

    this.chooseYear = [
      { ano: 2025 },
      { ano: 2024 },
      { ano: 2023 },
      { ano: 2022 },
      { ano: 2021 },
      { ano: 2020 },
    ];

    this.chooseMonth = [
      { mes: 'Janeiro' },
      { mes: 'Fevereiro' },
      { mes: 'Março' },
      { mes: 'Abril' },
      { mes: 'Maio' },
      { mes: 'Junho' },
      { mes: 'Julho' },
      { mes: 'Agosto' },
      { mes: 'Setembro' },
      { mes: 'Outubro' },
      { mes: 'Novembro' },
      { mes: 'Dezembro' },
    ];

    this.registerForm = this.fb.group({
      mes: ['', [Validators.required]],
    });

    this.registerFormYear = this.fb.group({
      ano: ['', [Validators.required]],
    });

    this.expenses = [
      {
        titulo: 'Exemplo',
        valor: 1000,
        descricao: 'Meu aluguel',
        categoria: 'Essencial',
      },
    ];

    this.getExpensesUser();
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

  onMonth() {
    const formData = { ...this.registerForm.value };
    this.monthSelected = formData.mes.mes;

    this.reportMonthExpenseComponent.getExpensesUser();
    this.reportMonthExpenseComponent.showDialog();

    this.registerForm.reset();
  }

  onYear() {
    const formData = { ...this.registerFormYear.value };
    this.yearSelected = formData.ano.ano;
   

    this.reportYearComponent.showDialog();

    this.registerFormYear.reset();
  }
}
