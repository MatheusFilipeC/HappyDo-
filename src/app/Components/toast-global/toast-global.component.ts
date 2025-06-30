import { Component, Input } from '@angular/core';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-toast-global',
  imports: [RippleModule, ToastModule],
  templateUrl: './toast-global.component.html',
  styleUrl: './toast-global.component.css',
})
export class ToastGlobalComponent {
  @Input() key!: string;
}
