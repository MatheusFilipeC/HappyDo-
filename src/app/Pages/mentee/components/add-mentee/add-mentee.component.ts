import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import {
  FormsModule,
  Validators,
  FormGroup,
  FormBuilder,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { Select } from 'primeng/select';
import { InputGlobalComponent } from '../../../../Components/input-global/input-global.component';
import { ToastGlobalComponent } from '../../../../Components/toast-global/toast-global.component';

import { User } from '../../../../Interface/user';

import { MessageService } from 'primeng/api';
import { UserService } from '../../../../Service/user.service';
import { UserGlobalService } from '../../../../Service/user-global.service';

@Component({
  selector: 'app-add-mentee',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    Select,
    SelectModule,
    CommonModule,
    ButtonModule,
    DialogModule,
    InputGlobalComponent,
    ToastGlobalComponent,
  ],
  templateUrl: './add-mentee.component.html',
  styleUrl: './add-mentee.component.css',
  providers: [MessageService, UserService],
})
export class AddMenteeComponent implements OnInit {
  @Output() menteeUpdated = new EventEmitter<void>();
  registerForm!: FormGroup;
  loading: boolean = false;
  keyToast: string = 'br';

  visible!: boolean;

  typeUser: User[] = [];
  userId!: number;

  classError = ['w-full', 'ng-dirty', 'ng-invalid'];
  class = ['w-full'];

  constructor(
    private fb: FormBuilder,
    private service: UserService,
    private serviceUserGlobal: UserGlobalService,
    private messageService: MessageService
  ) {}
  ngOnInit() {
    this.serviceUserGlobal.user$.subscribe((updatedUser) => {
      this.userId = updatedUser.usuarioId;
    });
    this.typeUser = [{ role: 'USER' }, { role: 'ADMIN', disabled: true }];

    this.registerForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      role: [this.typeUser[0], Validators.required],
    });
  }

  showDialog() {
    this.visible = true;
  }

  onAddNewMentee() {
    const formData = { ...this.registerForm.value };
    formData.role = formData.role.role;

    try {
      this.loading = true;
      if (this.registerForm.valid) {
        this.service.postNewMentee(this.userId, formData).subscribe({
          next: (value) => {
            this.showToasRight(
              'success',
              'Usuário cadastrado!',
              'Usuário cadastrado com sucesso!'
            );
            this.registerForm.reset();
            this.menteeUpdated.emit();
            this.registerForm.get('role')?.setValue(this.typeUser[0]);
            this.loading = false;
          },
          error: (err) => {
            console.error('Erro para criar usuário ', err.error);
            this.showToasRight(
              'error',
              'Erro ao criar usuário',
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
