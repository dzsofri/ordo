import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-landing',
  imports: [CommonModule, NavbarComponent, RouterModule, FormsModule],
  standalone: true,
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss'
})
export class LandingComponent {
   constructor(
    private api: ApiService,
    private auth: AuthService,
    private router: Router
  ) {}


  goToLogin() { 
    this.router.navigateByUrl('/login'); }
}
