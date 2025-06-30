import { Component, OnInit } from '@angular/core';
import {
  FormsModule,
  Validators,
  FormGroup,
  FormBuilder,
  ReactiveFormsModule,
} from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { FieldsetModule } from 'primeng/fieldset';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { InputGlobalComponent } from '../../Components/input-global/input-global.component';
import { MessageService } from 'primeng/api';
import { ToastGlobalComponent } from '../../Components/toast-global/toast-global.component';
import { RedefinirSenhaService } from '../../Service/redefinir-senha.service';

@Component({
  selector: 'app-check-email',
  imports: [
    InputGlobalComponent,
    ReactiveFormsModule,
    InputTextModule,
    FieldsetModule,
    FormsModule,
    CommonModule,
    ButtonModule,
    ToastGlobalComponent,
  ],
  templateUrl: './check-email.component.html',
  styleUrl: './check-email.component.css',
  providers: [MessageService, RedefinirSenhaService],
})
export class CheckEmailComponent implements OnInit {
  registerForm!: FormGroup;
  loading: boolean = false;
  keyToast: string = 'br';
  classError = ['w-full', 'ng-dirty', 'ng-invalid'];
  class = ['w-full'];

  constructor(
    private fb: FormBuilder,
    private messageService: MessageService,
    private service: RedefinirSenhaService
  ) {}

  ngOnInit() {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  onCheckEmail() {
    try {
      this.loading = true;
      if (this.registerForm.valid) {
        this.service.postCheckEmail(this.registerForm.value).subscribe({
          next: (value) => {
            const emailStorage = this.registerForm.get('email')?.value;
            localStorage.setItem('emailUser', emailStorage);
            this.showToasRight(
              'success',
              'Link enviado para e-mail!',
              `Verifique seu email, enviamos um link para redefinir sua senha! `
            );
            this.loading = false;
          },
          error: (err) => {
            console.error('Erro para login ', err.error);
            this.showToasRight(
              'info',
              'Verificação em andamento',
              'Usuário não encontrado, verifique se seu email está correto!'
            );

            this.loading = false;
          },
        });
      }
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
