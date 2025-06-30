import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FloatLabel } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule, FormControl } from '@angular/forms';

@Component({
  selector: 'app-input-global',
  imports: [
    FloatLabel,
    CommonModule,
    FormsModule,
    InputTextModule,
    ReactiveFormsModule,
  ],
  templateUrl: './input-global.component.html',
  styleUrl: './input-global.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputGlobalComponent {
  @Input() control!: FormControl | any;
  @Input() name!: string;
  @Input() class!: string[];
  @Input() id!: string;
  @Input() label!: string;
  @Input() typeInput!: string;
  // @Input() disabled!: boolean;
}
