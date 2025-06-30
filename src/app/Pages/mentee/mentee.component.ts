import {
  Component,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { DataViewModule } from 'primeng/dataview';
import {
  ConfirmationService,
  MenuItem,
  MessageService,
  SelectItem,
} from 'primeng/api';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { MenuComponent } from '../../Components/menu/menu.component';
import { KnobModule } from 'primeng/knob';
import { TooltipModule } from 'primeng/tooltip';
import { DividerModule } from 'primeng/divider';
import { SpeedDialModule } from 'primeng/speeddial';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import {
  FormsModule,
  Validators,
  FormGroup,
  FormBuilder,
  ReactiveFormsModule,
} from '@angular/forms';
import { AddMenteeComponent } from './components/add-mentee/add-mentee.component';
import { ListMentee } from '../../Interface/list-mentee';
import { UserService } from '../../Service/user.service';
import { UserGlobalService } from '../../Service/user-global.service';
import { UpdateMenteeComponent } from './components/update-mentee/update-mentee.component';
import { AddPaymentComponent } from './components/add-payment/add-payment.component';

import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastGlobalComponent } from '../../Components/toast-global/toast-global.component';
import { ToastModule } from 'primeng/toast';
import { ListStatusTaskService } from '../../Service/list-status-task.service';

import { forkJoin } from 'rxjs';
import { ExpensesService } from '../../Service/expenses.service';

@Component({
  selector: 'app-mentee',
  imports: [
    MenuComponent,
    DataViewModule,
    ToastModule,
    ScrollPanelModule,
    ConfirmDialogModule,
    SelectModule,
    DividerModule,
    FormsModule,
    TooltipModule,
    ReactiveFormsModule,
    KnobModule,
    CardModule,
    CommonModule,
    SpeedDialModule,
    ButtonModule,
    AddMenteeComponent,
    UpdateMenteeComponent,
    AddPaymentComponent,
  ],
  templateUrl: './mentee.component.html',
  styleUrl: './mentee.component.css',
  providers: [UserService, ConfirmationService, MessageService],
})
export class MenteeComponent implements OnInit {
  products!: any[];
  menu!: MenuItem[];

  userMenteeSelected: any;

  sortOptions!: SelectItem[];
  sortOrder!: number;
  sortField!: string;

  taskDone: number = 0;
  taskMissing: number = 0;
  taskPerformance: number = 0;

  userId!: number;

  nameMentee: ListMentee[] = [];
  userMentee: any[] = [];

  userMenteeFiltered: any[] = [];

  visible: boolean = false;

  @ViewChild(AddMenteeComponent) addMenteeComponent!: AddMenteeComponent;
  @ViewChild(AddPaymentComponent) addPaymentComponent!: AddPaymentComponent;
  @ViewChild(UpdateMenteeComponent)
  updateMenteeComponent!: UpdateMenteeComponent;

  private expensesService = inject(ExpensesService);

  constructor(
    private service: UserService,

    private serviceUserGlobal: UserGlobalService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.serviceUserGlobal.user$.subscribe((updatedUser) => {
      this.userId = updatedUser.usuarioId;
    });

    this.menu = [
      {
        label: 'Editar usuário',
        icon: 'pi pi-file-edit',
        command: () => {
          if (this.updateMenteeComponent) {
            this.updateMenteeComponent.showDialog();
          }
        },
      },
      {
        label: 'Definir mesada',
        icon: 'pi pi-wallet',
        command: () => {
          if (this.addPaymentComponent) {
            this.addPaymentComponent.showDialog();
          }
        },
      },
      {
        label: 'Excluir mentorado',
        icon: 'pi pi-trash',
        command: () => {
          this.confirmationService.confirm({
            message: `Deseja realmente excluir, ${this.userMenteeSelected.nome}?`,
            header: 'Excluir usuário',
            closable: true,
            closeOnEscape: true,
            icon: 'pi pi-trash',
            rejectButtonProps: {
              label: 'Cancelar',
              severity: 'secondary',
              outlined: true,
            },
            acceptButtonProps: {
              label: 'Excluir',
              severity: 'danger',
            },
            accept: () => {
              this.deleteUserMentee();
            },
            reject: () => {
              this.messageService.add({
                severity: 'info',
                summary: 'Usuário não excluído',
                detail: 'O usuário não foi excluído',
                life: 4000,
              });
            },
          });
        },
      },
    ];

    this.getMentee();
  }

  deleteUserMentee() {
    try {
      this.service.deleteMentee(this.userMenteeSelected.id).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Usuário excluído',
            detail: 'Usuário exlcuído com sucesso',
            life: 4000,
          });
          this.getMentee();
        },
        error: (err) => {
          console.error('Erro para excluir usuário: ', err.error.message);
          this.messageService.add({
            severity: 'error',
            summary: 'Usuário não foi excluído',
            detail: `${err.error.message} Exclua as tarefas deste usuário antes de excluir seu perfil`,
            life: 4000,
          });
        },
      });
    } catch (error) {
      console.error('Error do Try Catch', error);
    }
  }

  valueUserMentee(item: any) {
    this.userMenteeSelected = item;
  }

  onMenteeSelect(event: any) {
    if (event.value) {
      const nameUser = event.value.mentee;
      this.userMenteeFiltered = this.userMentee.filter(
        (mentee) => mentee.nome === nameUser
      );
    } else {
      this.userMenteeFiltered = [...this.userMentee];
    }
  }

  openModalAddMentee() {
    this.addMenteeComponent.showDialog();
  }

  getMentee() {
    try {
      this.service.getMeentFromAdmin(this.userId).subscribe({
        next: (value) => {
          this.userMentee = value.map((data: any) => ({
            id: data.usuarioId,
            email: data.email,
            nome: data.nome,
            role: data.role,
            saldo: data.saldoTotal,
            tarefasConcluidas: data.tarefasConcluidas,
            tarefasPendentes: data.tarefasPendentes,
            aproveitamento: this.calcularAproveitamento(
              data.tarefasConcluidas,
              data.tarefasPendentes
            ),
            valorMesadaMensal: data.valorMesadaMensal,
            despesasTotal: 0,
          }));

          this.nameMentee = value.map((data: any) => ({
            mentee: data.nome,
            id: data.usuarioId,
          }));

          const gastosRequests = this.userMentee.map((mentee) =>
            this.expensesService.getExpensesTotal(mentee.id)
          );

          forkJoin(gastosRequests).subscribe({
            next: (gastos: number[]) => {
              this.userMentee = this.userMentee.map((mentee, index) => ({
                ...mentee,
                despesasTotal: gastos[index] ?? 0,
              }));

              // ✅ MOVER PARA CÁ
              console.log(this.userMentee);
              this.userMenteeFiltered = [...this.userMentee];
            },
            error: (err) => {
              console.error('Erro ao carregar os gastos: ', err);
            },
          });
        },
        error: (err) => {
          console.error('Erro para carregar os dados ', err.error);
        },
      });
    } catch (error) {
      console.error('Error do Try Catch', error);
    }
  }

  formatValueCurrencyBR(valor: number): string {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }

  calcularAproveitamento(
    tarefasConcluidas: number,
    tarefasPendentes: number
  ): number {
    const totalTasks = tarefasConcluidas + tarefasPendentes;
    return totalTasks > 0
      ? Math.round((tarefasConcluidas / totalTasks) * 100)
      : 0;
  }
}
