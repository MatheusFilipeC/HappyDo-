import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { FieldsetModule } from 'primeng/fieldset';
import {
  FormsModule,
  Validators,
  FormGroup,
  FormBuilder,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { InputNumberModule } from 'primeng/inputnumber';
import { MessageService } from 'primeng/api';
import { ToastGlobalComponent } from '../../../../Components/toast-global/toast-global.component';
import { UserPaymentService } from '../../../../Service/user-payment.service';
import { InputGlobalComponent } from '../../../../Components/input-global/input-global.component';

@Component({
  selector: 'app-add-payment',
  imports: [
    FormsModule,
    InputNumberModule,
    DividerModule,
    FieldsetModule,
    ReactiveFormsModule,
    CommonModule,
    ButtonModule,
    DialogModule,
    ToastGlobalComponent,
    InputGlobalComponent,
  ],
  templateUrl: './add-payment.component.html',
  styleUrl: './add-payment.component.css',
  providers: [MessageService, UserPaymentService],
})
export class AddPaymentComponent implements OnInit {
  @Input() userSelected!: any;
  @Output() menteeUpdated = new EventEmitter<void>();
  visible!: boolean;
  registerForm!: FormGroup;
  loading: boolean = false;
  keyToast: string = 'br';

  classError = ['w-full', 'ng-dirty', 'ng-invalid'];
  class = ['w-full'];

  constructor(
    private fb: FormBuilder,
    private service: UserPaymentService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.registerForm = this.fb.group({
      valor: [, [Validators.required]],
      totalPontosPeriodo: [null, [Validators.required, Validators.min(1)]],
    });
  }

  showDialog() {
    this.visible = true;
  }

  onAddPayment() {
    this.postAddPayment();
  }

  postAddPayment() {
    const formData = { ...this.registerForm.value };
    formData.totalPontosPeriodo = Number(formData.totalPontosPeriodo);

    try {
      this.loading = true;
      this.service.postNewPayment(this.userSelected.id, formData).subscribe({
        next: (value) => {
          this.showToasRight(
            'success',
            'Mesada adicionada!',
            'Mesada adicionada com sucesso!'
          );
          this.menteeUpdated.emit();
          this.registerForm.reset();
          this.loading = false;
        },
        error: (err) => {
          console.error('Erro para add mesada para usuário ', err.error);
          if (err.error.message) {
            this.showToasRight(
              'error',
              'Error ao cadastrar mesada',
              err.error.message
            );
          } else {
            this.showToasRight(
              'error',
              'Erro ao add mesada',
              err.error.nome == undefined
                ? 'Estamos ajustando voltamos em breve'
                : err.error.nome
            );
          }

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
