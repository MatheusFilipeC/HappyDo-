import { Component, OnInit, ViewChild } from '@angular/core';
import { Drawer, DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { AvatarModule } from 'primeng/avatar';
import { StyleClass } from 'primeng/styleclass';
import { Ripple } from 'primeng/ripple';
import { UserGlobalService } from '../../Service/user-global.service';

@Component({
  selector: 'app-drawer',
  imports: [
    DrawerModule,
    ButtonModule,
    AvatarModule,
    Ripple,
    StyleClass,
    CommonModule,
  ],
  templateUrl: './drawer.component.html',
  styleUrl: './drawer.component.css',
})
export class DrawerComponent implements OnInit {
  @ViewChild('drawerRef') drawerRef!: Drawer;

  visible: boolean = false;
  userRole!: string;
  userName!:string;

  constructor(private serviceUserGlobal: UserGlobalService) {}
  ngOnInit() {
    this.serviceUserGlobal.user$.subscribe((updatedUser) => {
      this.userRole = updatedUser.role;
      this.userName = updatedUser.nome
    });
  }

  closeCallback(e: any): void {
    this.drawerRef.close(e);
  }
}
