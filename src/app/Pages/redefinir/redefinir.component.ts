import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { InputGlobalComponent } from '../../Components/input-global/input-global.component';
import { InputPasswordGlobalComponent } from '../../Components/input-password-global/input-password-global.component';
import {
  FormsModule,
  Validators,
  FormGroup,
  FormBuilder,
  ReactiveFormsModule,
} from '@angular/forms';
import { MessageService } from 'primeng/api';
import { RedefinirSenhaService } from '../../Service/redefinir-senha.service';
import { ToastGlobalComponent } from '../../Components/toast-global/toast-global.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-redefinir',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    InputGlobalComponent,
    InputPasswordGlobalComponent,
    ToastGlobalComponent,
  ],
  templateUrl: './redefinir.component.html',
  styleUrl: './redefinir.component.css',
  providers: [MessageService, RedefinirSenhaService],
})
export class RedefinirComponent implements OnInit {
  registerForm!: FormGroup;
  loading: boolean = false;
  keyToast: string = 'br';
  classError = ['w-full', 'ng-dirty', 'ng-invalid'];
  class = ['w-full'];

  constructor(
    private fb: FormBuilder,
    private messageService: MessageService,
    private service: RedefinirSenhaService,
    private route: Router
  ) {}

  ngOnInit() {
    const emailStorage = localStorage.getItem('emailUser');
    this.registerForm = this.fb.group({
      email: [
        { value: emailStorage, disabled: true },
        [Validators.required, Validators.email],
      ],
      novaSenha: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onUpdatePassword() {
    try {
      this.loading = true;
      if (this.registerForm.valid) {
        this.service
          .postUpdatePassword(this.registerForm.getRawValue())
          .subscribe({
            next: (value) => {
              this.showToasRight(
                'success',
                'Senha redefinida com sucesso!',
                `Sua senha agora foi redefinida e atualizada.`
              );

              localStorage.removeItem('emailUser');
              setTimeout(() => {
                this.loading = false;
                this.route.navigate(['login']);
              }, 3000);
            },
            error: (err) => {
              console.error('Erro para redefinir senha ', err);
              this.showToasRight(
                'error',
                'Erro em redefinir a senha',
                err.error == undefined
                  ? 'Estamos ajustando voltamos em breve'
                  : err.error.message
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
