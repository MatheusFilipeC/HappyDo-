import { Component, OnInit } from '@angular/core';
import {
  FormsModule,
  Validators,
  FormGroup,
  FormBuilder,
  ReactiveFormsModule,
} from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { CommonModule } from '@angular/common';
import { MessageService } from 'primeng/api';

import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';

import { DividerModule } from 'primeng/divider';

import { InputGlobalComponent } from '../../Components/input-global/input-global.component';
import { InputPasswordGlobalComponent } from '../../Components/input-password-global/input-password-global.component';
import { LoginUserService } from '../../Service/login-user.service';
import { ToastGlobalComponent } from '../../Components/toast-global/toast-global.component';

import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [
    InputTextModule,
    FormsModule,
    DividerModule,
    ReactiveFormsModule,
    CommonModule,
    PasswordModule,
    ButtonModule,
    InputGlobalComponent,
    InputPasswordGlobalComponent,
    ToastGlobalComponent,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  providers: [MessageService, LoginUserService],
})
export class LoginComponent implements OnInit {
  registerForm!: FormGroup;
  loading: boolean = false;
  keyToast: string = 'br';
  classError = ['w-full', 'ng-dirty', 'ng-invalid'];
  class = ['w-full'];

  constructor(
    private fb: FormBuilder,
    private messageService: MessageService,
    private service: LoginUserService,
    private route: Router
  ) {}
  ngOnInit() {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onLogin() {
    try {
      this.loading = true;
      if (this.registerForm.valid) {
        this.service.postLogin(this.registerForm.value).subscribe({
          next: (value) => {
            localStorage.setItem('user', JSON.stringify(value));
            this.showToasRight(
              'success',
              'Usuário cadastrado!',
              `Que bom te ver por aqui, ${value.nome}!`
            );
            setTimeout(() => {
              this.loading = false;
              this.route.navigate(['dashboard']);
            }, 3000);
          },
          error: (err) => {
            console.error('Erro para login ', err.error);
            this.showToasRight(
              'error',
              'Erro ao fazer login',
              err.error == undefined
                ? 'Estamos ajustando voltamos em breve'
                : err.error
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
