import { Component, OnInit } from '@angular/core';
import { MenuComponent } from '../../Components/menu/menu.component';
import { CardModule } from 'primeng/card';
import { SelectModule } from 'primeng/select';
import { Select } from 'primeng/select';
import {
  FormsModule,
  Validators,
  FormGroup,
  FormBuilder,
  ReactiveFormsModule,
} from '@angular/forms';
import { FloatLabel } from 'primeng/floatlabel';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { TextareaModule } from 'primeng/textarea';
import { FieldsetModule } from 'primeng/fieldset';
import { AvatarModule } from 'primeng/avatar';
import { DividerModule } from 'primeng/divider';
import { MessageService } from 'primeng/api';
import { InputGlobalComponent } from '../../Components/input-global/input-global.component';
import { ToastGlobalComponent } from '../../Components/toast-global/toast-global.component';
import { Frequence } from '../../Interface/frequence';
import { UserService } from '../../Service/user.service';
import { UserGlobalService } from '../../Service/user-global.service';
import { ListMentee } from '../../Interface/list-mentee';
import { TaskService } from '../../Service/task.service';
import { MultiSelectModule } from 'primeng/multiselect';
import { DaysList } from '../../Interface/daysList';

@Component({
  selector: 'app-mentee-task',
  imports: [
    MenuComponent,
    MultiSelectModule,
    AvatarModule,
    DividerModule,
    FloatLabel,
    CardModule,
    SelectModule,
    FieldsetModule,
    Select,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    ButtonModule,
    DatePickerModule,
    TextareaModule,
    InputGlobalComponent,
    ToastGlobalComponent,
  ],
  templateUrl: './mentee-task.component.html',
  styleUrl: './mentee-task.component.css',
  providers: [MessageService, UserService, TaskService],
})
export class MenteeTaskComponent implements OnInit {
  registerForm!: FormGroup;
  userId!: number;
  idMentee!: number;
  userMentee: any[] = [];

  loading: boolean = false;
  keyToast: string = 'br';

  frequence: Frequence[] = [];
  days: DaysList[] = [];
  daysWeekDisabled = false;
  dateStart: Date | undefined;
  dateEndMin!: Date | undefined;

  nameMentee: ListMentee[] = [];
  selectedMentee: string = ''; // Começa vazio
  isMenteeSelected: boolean = false;

  classError = ['w-full', 'ng-dirty', 'ng-invalid'];
  class = ['w-full'];

  constructor(
    private fb: FormBuilder,
    private service: UserService,
    private serviceTask: TaskService,
    private messageService: MessageService,
    private serviceUserGlobal: UserGlobalService
  ) {}
  ngOnInit() {
    this.selectedMentee = 'Mentorado';

    this.serviceUserGlobal.user$.subscribe((updatedUser) => {
      this.userId = updatedUser.usuarioId;
    });

    this.dateStart = new Date();
    this.dateStart.getDate();

    this.days = [
      { day: 'Segunda' },
      { day: 'Terça' },
      { day: 'Quarta' },
      { day: 'Quinta' },
      { day: 'Sexta' },
      { day: 'Sabado' },
      { day: 'Domingo' },
    ];

    this.frequence = [
      { choose: 'DIARIA' },
      { choose: 'SEMANAL' },
      { choose: 'MENSAL' },
      { choose: 'ESPORADICA' },
    ];

    this.getMentee();

    this.registerForm = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(3)]],
      descricao: ['', [Validators.required, Validators.minLength(8)]],
      categoria: ['', [Validators.required, Validators.minLength(3)]],
      pontuacao: [null, [Validators.required, Validators.min(1)]],
      frequencia: ['', [Validators.required]],
      dataInicio: ['', [Validators.required]],
      dataFim: ['', [Validators.required]],
      diasSemana: [[], []],
    });

    this.registerForm
      .get('dataInicio')
      ?.valueChanges.subscribe((newStartDate) => {
        this.onStartDateChange(newStartDate);
      });
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
            tarefasConcluidas: data.tarefasConcluidas,
            tarefasPendentes: data.tarefasPendentes,
          }));

          this.nameMentee = value.map((data: any) => ({
            mentee: data.nome,
            id: data.usuarioId,
          }));
        },
        error: (err) => {
          console.error('Erro para carregar os dados ', err.error);
        },
      });
    } catch (error) {
      console.error('Error do Try Catch', error);
    }
  }

  onStartDateChange(newStartDate: Date) {
    if (newStartDate) {
      this.dateEndMin = newStartDate;

      const currentEndDate = this.registerForm.get('dataFim')?.value;
      if (currentEndDate && currentEndDate < newStartDate) {
        this.registerForm.get('dataFim')?.setValue(null);
      }
    }
  }

  onMenteeSelect(value: any) {
    if (value) {
      this.selectedMentee = value.mentee;
      this.isMenteeSelected = true;
      this.idMentee = value.id;
    } else {
      this.selectedMentee = 'Mentorado';
      this.isMenteeSelected = false;
    }
  }

  onAddTaskMentee() {
    const formData = { ...this.registerForm.value };

    formData.frequencia = formData.frequencia.choose;
    formData.pontuacao = Number(formData.pontuacao);
    formData.dataInicio = this.formatDate(formData.dataInicio);
    formData.dataFim = this.formatDate(formData.dataFim);
    formData.diasSemana = formData.diasSemana.map((d: DaysList) => d.day);

    try {
      this.loading = true;
      if (this.registerForm.valid) {
        this.serviceTask
          .postTask(this.userId, this.idMentee, formData)
          .subscribe({
            next: (value) => {
              this.showToasRight(
                'success',
                'Tarefa cadastrada!',
                'Tarefa foi cadastrada com sucesso!'
              );

              this.registerForm.reset({
                titulo: '',
                descricao: '',
                categoria: '',
                pontuacao: null,
                frequencia: '',
                dataInicio: '',
                dataFim: '',
                diasSemana: [],
              });

              this.loading = false;
            },
            error: (err) => {
              console.error('Erro para registrar tarefa ', err.error);

              if (err.error.message) {
                this.showToasRight(
                  'error',
                  'Error ao cadastrar tarefa',
                  err.error.message
                );
              } else {
                this.showToasRight(
                  'error',
                  'Erro ao cadastrar tarefa',
                  err.error.nome == undefined
                    ? 'Estamos ajustando voltamos em breve'
                    : err.error.nome
                );
              }

              this.loading = false;
            },
          });
      }
    } catch (error) {
      console.error('Error do Try Catch', error);
      this.loading = false;
    }
  }

  formatDate(date: Date): string {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
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

  onSelectedFrequence(item: any) {
    if (item.value != null && item.value.choose == 'SEMANAL') {
      this.daysWeekDisabled = true;

      this.registerForm.get('diasSemana')?.setValidators([Validators.required]);
      this.registerForm.get('diasSemana')?.updateValueAndValidity();
    } else {
      this.daysWeekDisabled = false;
      this.registerForm.get('diasSemana')?.clearValidators();
      this.registerForm.get('diasSemana')?.updateValueAndValidity();
    }
  }
}
