import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { DrawerModule } from 'primeng/drawer';
import { DividerModule } from 'primeng/divider';
import { ChipModule } from 'primeng/chip';
import { OverlayBadgeModule } from 'primeng/overlaybadge';
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
import { User } from '../../../../Interface/user';
import { MessageService } from 'primeng/api';
import { ToastGlobalComponent } from '../../../../Components/toast-global/toast-global.component';
import { InputPasswordGlobalComponent } from '../../../../Components/input-password-global/input-password-global.component';
import { InputGlobalComponent } from '../../../../Components/input-global/input-global.component';
import { UpdateUserService } from '../../../../Service/update-user.service';

@Component({
  selector: 'app-update-mentee',
  imports: [
    DrawerModule,
    ReactiveFormsModule,
    OverlayBadgeModule,
    ChipModule,
    DividerModule,
    FormsModule,
    CommonModule,
    ButtonModule,
    SelectModule,
    Select,
    ToastGlobalComponent,
    InputPasswordGlobalComponent,
    InputGlobalComponent,
  ],
  templateUrl: './update-mentee.component.html',
  styleUrl: './update-mentee.component.css',
  providers: [MessageService, UpdateUserService],
})
export class UpdateMenteeComponent implements OnInit {
  @Input() userSelected!: any;

  @Output() menteeUpdated = new EventEmitter<void>();

  visible!: boolean;

  registerForm!: FormGroup;
  loading: boolean = false;
  keyToast: string = 'br';

  nameUser!: string;
  idUserMentee!: number;

  typeUser: User[] = [];

  classError = ['w-full', 'ng-dirty', 'ng-invalid'];
  class = ['w-full'];

  constructor(
    private fb: FormBuilder,
    private service: UpdateUserService,
    private messageService: MessageService
  ) {}
  ngOnInit() {
    this.typeUser = [{ role: 'USER' }, { role: 'ADMIN', disabled: true }];

    this.registerForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required, Validators.minLength(6)]],
      role: [this.typeUser[0], Validators.required],
    });
  }

  showDialog() {
    this.registerForm.get('nome')?.setValue(this.userSelected.nome);
    this.registerForm.get('email')?.setValue(this.userSelected.email);
    this.nameUser = this.userSelected.nome;
    this.visible = true;
  }

  updateMentee() {
    const formData = { ...this.registerForm.value };
    formData.role = formData.role.role;

    try {
      this.loading = true;
      if (this.registerForm.valid) {
        this.service.updateUser(this.userSelected.id, formData).subscribe({
          next: (value) => {
            this.showToasRight(
              'success',
              'Usuário Atualizado!',
              'Perfil foi atualizado com sucesso!'
            );
            this.nameUser = formData.nome;
            this.registerForm.get('senha')?.reset();
            this.menteeUpdated.emit();
            this.registerForm.get('role')?.setValue(this.typeUser[0]);
            this.loading = false;
          },
          error: (err) => {
            console.error('Erro para atualizar ', err.error);
            this.showToasRight(
              'error',
              'Erro ao atualizar usuário',
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
