import { Component, OnInit } from '@angular/core';
import { MenubarModule } from 'primeng/menubar';
import { MenuItem } from 'primeng/api';
import { Menubar } from 'primeng/menubar';
import { BadgeModule } from 'primeng/badge';
import { AvatarModule } from 'primeng/avatar';
import { InputTextModule } from 'primeng/inputtext';
import { CommonModule } from '@angular/common';
import { Ripple } from 'primeng/ripple';
import {
  FormsModule,
  Validators,
  FormGroup,
  FormBuilder,
  ReactiveFormsModule,
} from '@angular/forms';
import { DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';
import { DrawerComponent } from '../drawer/drawer.component';
import { Router, RouterModule } from '@angular/router';
import { SelectModule } from 'primeng/select';
import { Select } from 'primeng/select';
import { DividerModule } from 'primeng/divider';
import { ChipModule } from 'primeng/chip';
import { InputGlobalComponent } from '../input-global/input-global.component';
import { InputPasswordGlobalComponent } from '../input-password-global/input-password-global.component';
import { User } from '../../Interface/user';
import { MessageService } from 'primeng/api';
import { ToastGlobalComponent } from '../toast-global/toast-global.component';
import { UpdateUserService } from '../../Service/update-user.service';
import { UserGlobalService } from '../../Service/user-global.service';
import { Tooltip } from 'primeng/tooltip';

@Component({
  selector: 'app-menu',
  imports: [
    MenubarModule,
    Select,
    ChipModule,
    Tooltip,
    RouterModule,
    SelectModule,
    DividerModule,
    FormsModule,
    ReactiveFormsModule,
    DrawerModule,
    ButtonModule,
    Menubar,
    BadgeModule,
    AvatarModule,
    InputTextModule,
    Ripple,
    CommonModule,
    DrawerComponent,
    InputGlobalComponent,
    InputPasswordGlobalComponent,
    ToastGlobalComponent,
  ],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css',
  providers: [UpdateUserService, MessageService],
})
export class MenuComponent implements OnInit {
  items: MenuItem[] | undefined;
  visible: boolean = false;
  registerForm!: FormGroup;
  keyToast: string = 'br';
  typeUser: User[] = [];
  loading: boolean = false;

  user: any;

  nameUser!: string;

  constructor(
    private fb: FormBuilder,
    private service: UpdateUserService,
    private messageService: MessageService,
    private serviceUserGlobal: UserGlobalService,
    private route: Router
  ) {}

  classError = ['w-full', 'ng-dirty', 'ng-invalid'];
  class = ['w-full'];

  ngOnInit() {
    this.user = JSON.parse(localStorage.getItem('user') || '{}');

    this.serviceUserGlobal.user$.subscribe((updatedUser) => {
      this.nameUser = updatedUser.nome;
    });

    this.typeUser = [{ role: 'ADMIN' }, { role: 'USER', disabled: true }];

    this.registerForm = this.fb.group({
      nome: [this.user.nome, [Validators.required, Validators.minLength(2)]],
      email: [this.user.email, [Validators.required, Validators.email]],
      senha: ['', [Validators.required, Validators.minLength(6)]],
      role: [this.typeUser[0], Validators.required],
    });

    this.items = [
      {
        label: 'Home',
        icon: 'pi pi-home',
        routerLink: '/dashboard',
      },
      {
        label: 'Tarefas',
        icon: 'pi pi-search',
        items: [
          {
            label: 'Suas tarefas',
            url: '/tarefas',
          },
          {
            label: 'Gestão de tarefas',
            url: '/gerenciar-tarefas',
          },
        ],
      },
      {
        label: 'Financeiro',
        items: [
          {
            label: 'Gastos mensais',
            url: '/gastos',
          },
          {
            label: 'Relatório de gastos',
            url: '/relatorio-gastos',
          },
        ],
      },
    ];
    if (this.user.role === 'ADMIN') {
      this.items.push({
        label: 'Mentoria',
        items: [
          { label: 'Mentorados', url: '/mentoria' },
          {
            label: 'Cadastro de tarefas mentorados',
            url: '/tarefas-mentorados',
          },
          { label: 'Tarefas dos mentorados', url: '/lista-tarefas-mentorados' },
        ],
      });
    }
  }

  openModalUpdateManager() {
    if (this.user.role === 'USER') {
      this.visible = false;
    } else {
      this.visible = true;
    }
  }

  onUpdateUser() {
    const valueUser = this.registerForm.get('role')?.value.role;
    this.registerForm.get('role')?.setValue(valueUser);

    try {
      this.loading = true;
      if (this.registerForm.valid) {
        this.service
          .updateUser(this.user.usuarioId, this.registerForm.value)
          .subscribe({
            next: (value) => {
              this.serviceUserGlobal.updateUser(value);
              this.showToasRight(
                'success',
                'Usuário Atualizado!',
                'Seu perfil foi atualizado com sucesso!'
              );
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

  logoutUser() {
    this.loading = true;
    localStorage.clear();
    setTimeout(() => {
      this.route.navigate(['login']).then(() => {
        location.reload();
      });
      this.loading = false;
    }, 400);
  }
}
