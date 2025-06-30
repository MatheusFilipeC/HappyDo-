import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { SelectModule } from 'primeng/select';
import { MessageService } from 'primeng/api';
import { TextareaModule } from 'primeng/textarea';
import { FloatLabel } from 'primeng/floatlabel';
import {
  FormsModule,
  Validators,
  FormGroup,
  FormBuilder,
  ReactiveFormsModule,
} from '@angular/forms';
import { InputGlobalComponent } from '../../../../Components/input-global/input-global.component';
import { ToastGlobalComponent } from '../../../../Components/toast-global/toast-global.component';
import { CategoryExpense } from '../../../../Interface/categoryExpense';
import { InputNumberModule } from 'primeng/inputnumber';
import { ExpensesService } from '../../../../Service/expenses.service';
import { UserGlobalService } from '../../../../Service/user-global.service';

@Component({
  selector: 'app-form-expense',
  imports: [
    CardModule,
    InputNumberModule,
    ButtonModule,
    SelectModule,
    FloatLabel,
    TextareaModule,
    FormsModule,
    ReactiveFormsModule,
    InputGlobalComponent,
    CommonModule,
    ToastGlobalComponent,
  ],
  templateUrl: './form-expense.component.html',
  styleUrl: './form-expense.component.css',
  providers: [MessageService, ExpensesService],
})
export class FormExpenseComponent implements OnInit {
  @Output() refreshList = new EventEmitter<void>();

  registerForm!: FormGroup;
  loading: boolean = false;
  keyToast: string = 'br';
  typeCategory: CategoryExpense[] = [];
  userId!: number;

  classError = ['w-full', 'ng-dirty', 'ng-invalid'];
  class = ['w-full'];

  constructor(
    private fb: FormBuilder,
    private service: ExpensesService,
    private messageService: MessageService,
    private serviceUserGlobal: UserGlobalService
  ) {}

  ngOnInit() {
    this.serviceUserGlobal.user$.subscribe((updatedUser) => {
      this.userId = updatedUser.usuarioId;
    });
    this.typeCategory = [
      { category: 'ESSENCIAL' },
      { category: 'NAO_ESSENCIAL' },
    ];

    this.registerForm = this.fb.group({
      valor: [, [Validators.required]],
      categoria: ['', [Validators.required]],
      produto: ['', [Validators.required]],
      titulo: ['', [Validators.required, Validators.minLength(2)]],
      descricao: ['', [Validators.required, Validators.minLength(5)]],
    });
  }

  onExpense() {
    const formData = { ...this.registerForm.value };
    formData.categoria = formData.categoria.category;

    this.postExpense(formData);
  }

  postExpense(data: any) {
    try {
      this.loading = true;
      this.service.postAddExpenses(this.userId, data).subscribe({
        next: (value) => {
          console.log(value);
          this.showToasRight(
            'success',
            'Gasto Registrado',
            'Seu gasto foi registrado com sucesso!'
          );
          this.refreshList.emit();
          this.registerForm.reset();
          this.loading = false;
        },
        error: (err) => {
          console.error('Erro para enviar os dados do gasto ', err.error);
          this.showToasRight(
            'error',
            'Saldo insuficiente',
            `${err.error.message}`
          );
          this.loading = false;
        },
      });
    } catch (error) {
      console.error('Error do Try Catch', error);
      this.loading = false;
    }
  }

  showToasRight(color: string, title: string, msg: string) {
    this.messageService.add({
      severity: color,
      summary: title,
      detail: msg,
      key: this.keyToast,
      life: 4000,
    });
  }
}
