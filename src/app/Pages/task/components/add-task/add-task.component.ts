import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import {
  FormsModule,
  Validators,
  FormGroup,
  FormBuilder,
  ReactiveFormsModule,
} from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { Select } from 'primeng/select';
import { FloatLabel } from 'primeng/floatlabel';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputGlobalComponent } from '../../../../Components/input-global/input-global.component';
import { ToastGlobalComponent } from '../../../../Components/toast-global/toast-global.component';
import { Frequence } from '../../../../Interface/frequence';
import { UserGlobalService } from '../../../../Service/user-global.service';
import { TaskService } from '../../../../Service/task.service';
import { MessageService } from 'primeng/api';
import { MultiSelectModule } from 'primeng/multiselect';
import { DaysList } from '../../../../Interface/daysList';

@Component({
  selector: 'app-add-task',
  imports: [
    DialogModule,
    MultiSelectModule,
    ButtonModule,
    Select,
    FloatLabel,
    TextareaModule,
    DatePickerModule,
    ReactiveFormsModule,
    SelectModule,
    CommonModule,
    FormsModule,
    InputGlobalComponent,
    ToastGlobalComponent,
  ],
  templateUrl: './add-task.component.html',
  styleUrl: './add-task.component.css',
  providers: [TaskService, MessageService],
})
export class AddTaskComponent implements OnInit {
  @Input() visible!: boolean;
  @Output() refreshList = new EventEmitter<void>();

  registerForm!: FormGroup;
  loading: boolean = false;
  keyToast: string = 'br';
  frequence: Frequence[] = [];
  days: DaysList[] = [];
  userId!: number;

  daysWeekDisabled = false;

  dateStart: Date | undefined;
  dateEndMin!: Date | undefined;

  classError = ['w-full', 'ng-dirty', 'ng-invalid'];
  class = ['w-full'];

  constructor(
    private fb: FormBuilder,
    private service: TaskService,
    private messageService: MessageService,
    private serviceUserGlobal: UserGlobalService
  ) {}

  ngOnInit() {
    this.serviceUserGlobal.user$.subscribe((taskUser) => {
      this.userId = taskUser.usuarioId;
    });

    this.dateStart = new Date();
    this.dateStart.getDate();

    this.frequence = [
      { choose: 'DIARIA' },
      { choose: 'SEMANAL' },
      { choose: 'MENSAL' },
      { choose: 'ESPORADICA' },
    ];

    this.days = [
      { day: 'Segunda' },
      { day: 'Terça' },
      { day: 'Quarta' },
      { day: 'Quinta' },
      { day: 'Sexta' },
      { day: 'Sabado' },
      { day: 'Domingo' },
    ];

    this.registerForm = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(3)]],
      descricao: ['', [Validators.required, Validators.minLength(8)]],
      categoria: ['', [Validators.required, Validators.minLength(3)]],
      frequencia: ['', [Validators.required]],
      dataInicio: ['', [Validators.required]],
      dataFim: ['', [Validators.required]],
      diasSemana: [[]],
    });

    this.registerForm
      .get('dataInicio')
      ?.valueChanges.subscribe((newStartDate) => {
        this.onStartDateChange(newStartDate);
      });
  }

  refreshDataListTask() {
    this.refreshList.emit();
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

  onAddTask() {
    const formData = { ...this.registerForm.value };
    formData.frequencia = formData.frequencia.choose;
    formData.dataInicio = this.formatDate(formData.dataInicio);
    formData.dataFim = this.formatDate(formData.dataFim);
    formData.diasSemana = formData.diasSemana.map((d: DaysList) => d.day);

    try {
      this.loading = true;
      if (this.registerForm.valid) {
        this.service.postTask(this.userId, this.userId, formData).subscribe({
          next: (value) => {
            this.showToasRight(
              'success',
              'Tarefa cadastrada!',
              'Tarefa foi cadastrada com sucesso!'
            );
            this.refreshDataListTask();

            this.registerForm.reset({
              titulo: '',
              descricao: '',
              categoria: '',
              frequencia: '',
              dataInicio: '',
              dataFim: '',
              diasSemana: [],
            });

            this.loading = false;
          },
          error: (err) => {
            console.error('Erro para registrar tarefa ', err.error);
            this.showToasRight(
              'error',
              'Erro ao cadastrar tarefa',
              err.error.nome == undefined
                ? 'Estamos ajustando voltamos em breve'
                : err.error.nome
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

  formatDate(date: Date): string {
    if (!date) return '';

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  showDialog() {
    this.visible = true;
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
