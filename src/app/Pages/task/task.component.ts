import { Component } from '@angular/core';
import { MenuComponent } from '../../Components/menu/menu.component';
import { CardModule } from 'primeng/card';
import { DataviewComponent } from "./components/dataview/dataview.component";

@Component({
  selector: 'app-task',
  imports: [MenuComponent, CardModule, DataviewComponent],
  templateUrl: './task.component.html',
  styleUrl: './task.component.css',
})
export class TaskComponent {}
