import { Component, OnInit } from '@angular/core';
import {
  FormsModule,
  Validators,
  FormGroup,
  FormBuilder,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { InputGlobalComponent } from '../../Components/input-global/input-global.component';
import { InputPasswordGlobalComponent } from '../../Components/input-password-global/input-password-global.component';
import { SelectModule } from 'primeng/select';
import { User } from '../../Interface/user';
import { Select } from 'primeng/select';
import { CadastroService } from '../../Service/cadastro.service';

import { MessageService } from 'primeng/api';
import { ToastGlobalComponent } from '../../Components/toast-global/toast-global.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    ReactiveFormsModule,
    PasswordModule,
    ButtonModule,
    SelectModule,
    Select,
    InputGlobalComponent,
    InputPasswordGlobalComponent,
    ToastGlobalComponent,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
  providers: [CadastroService, MessageService],
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  typeUser: User[] = [];
  loading: boolean = false;
  keyToast: string = 'br';

  constructor(
    private fb: FormBuilder,
    private service: CadastroService,
    private messageService: MessageService,
    private route: Router
  ) {}

  classError = ['w-full', 'ng-dirty', 'ng-invalid'];
  class = ['w-full'];

  ngOnInit() {
    this.typeUser = [{ role: 'ADMIN' }, { role: 'USER', disabled: true }];

    this.registerForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required, Validators.minLength(6)]],
      role: [this.typeUser[0], Validators.required],
    });
  }

  onRegister() {
    const valueUser = this.registerForm.get('role')?.value.role;
    this.registerForm.get('role')?.setValue(valueUser);

    try {
      this.loading = true;
      if (this.registerForm.valid) {
        this.service.postRegister(this.registerForm.value).subscribe({
          next: (value) => {
            this.showToasRight(
              'success',
              'Usuário cadastrado!',
              'Seu cadastro foi realizado com sucesso!'
            );
            this.registerForm.get('role')?.setValue(this.typeUser[0]);
            setTimeout(() => {
              this.registerForm.reset();
              this.loading = false;
              this.route.navigate(['login']);
            }, 3000);
          },
          error: (err) => {
            console.error('Erro para registrar ', err.error);
            this.showToasRight(
              'error',
              'Erro ao cadastrar usuário',
              err.error.nome == undefined
                ? 'Estamos ajustando voltamos em breve'
                : err.error.nome
            );
            this.registerForm.get('role')?.setValue(this.typeUser[0]);
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
