import { CommonModule } from '@angular/common';
import { Component, OnInit, Input, input } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ToastGlobalComponent } from '../../../../Components/toast-global/toast-global.component';
import { MessageService } from 'primeng/api';
import { InputPasswordGlobalComponent } from '../../../../Components/input-password-global/input-password-global.component';
import { InputGlobalComponent } from '../../../../Components/input-global/input-global.component';
import { UserGlobalService } from '../../../../Service/user-global.service';

import { FieldsetModule } from 'primeng/fieldset';
import { RedefinirSenhaService } from '../../../../Service/redefinir-senha.service';

@Component({
  selector: 'app-reset-password',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    FieldsetModule,
    CommonModule,
    ButtonModule,
    DialogModule,
    ToastGlobalComponent,
    InputPasswordGlobalComponent,
    InputGlobalComponent,
  ],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css',
  providers: [MessageService, RedefinirSenhaService],
})
export class ResetPasswordComponent implements OnInit {
  @Input() visible!: boolean;
  disabledInputEmail: boolean = true;
  keyToast: string = 'br';
  loading: boolean = false;
  registerForm!: FormGroup;
  emailUser!: string;

  classError = ['w-full', 'ng-dirty', 'ng-invalid'];
  class = ['w-full'];

  constructor(
    private fb: FormBuilder,
    private messageService: MessageService,
    private service: RedefinirSenhaService,
    private serviceUserGlobal: UserGlobalService
  ) {}

  ngOnInit() {
    this.serviceUserGlobal.user$.subscribe((updatedUser) => {
      this.emailUser = updatedUser.email;
    });

    this.registerForm = this.fb.group({
      email: [
        { value: this.emailUser, disabled: true },
        [Validators.required, Validators.email],
      ],
      novaSenha: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onResetPassword() {
    const formData = { ...this.registerForm.getRawValue() };
    console.log(formData);

    try {
      this.loading = true;
      this.service.postUpdatePassword(formData).subscribe({
        next: (value) => {
          this.showToasRight('success', 'Senha redefinida!', value);

          setTimeout(() => {
            this.visible = false;
            this.loading = false;
          }, 400);
        },
        error: (err) => {
          console.error('Erro para criar usuário ', err.error);
          this.showToasRight(
            'error',
            'Erro ao redefinir senha',
            err.error.nome == undefined
              ? 'Estamos ajustando voltamos em breve'
              : err.error.nome
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
