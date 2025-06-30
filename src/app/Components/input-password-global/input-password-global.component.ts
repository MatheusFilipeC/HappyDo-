import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { PasswordModule } from 'primeng/password';
import { ReactiveFormsModule, FormControl, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-input-password-global',
  imports: [
    PasswordModule,
    FormsModule,
    CommonModule,
    DividerModule,
    ReactiveFormsModule,
  ],
  templateUrl: './input-password-global.component.html',
  styleUrl: './input-password-global.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputPasswordGlobalComponent {
  @Input() control!: FormControl | any;
  @Input() name!: string;
  @Input() placeholder!: string;
  @Input() class!: string[];
  @Input() id!: string;
}
