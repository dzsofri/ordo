import { Component } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { User } from '../../interfaces/user';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

   isPasswordVisible = false;
  user: User = { email: '', password: '' };

  // Modal változók
  modalVisible = false;
  modalType: 'success' | 'error' | 'warning' | 'info' = 'info';
  modalMessage = '';
  invalidFields: string[] = [];

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private router: Router
  ) {}

  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

 
updateUserStatus(newStatus: string): void {
  this.api.updateStatus(newStatus).subscribe(response => {
    if (response.message === 'Státusz sikeresen frissítve.') {
      console.log('Státusz sikeresen frissítve');
    } else {
      console.error('Hiba történt a státusz frissítésekor', response.message);
    }
  });
}


 onSubmit() {
  this.invalidFields = []; // Reset the invalid fields

  this.api.login(this.user.email, this.user.password).subscribe({
    next: (res: any) => {
      this.invalidFields = res.invalid || [];

      if (this.invalidFields.length === 0) {
        if (res.token) {
          this.auth.login(res.token);

          // Böngésző alert a sikerhez
          alert(res.message || 'Login successful!');

          this.updateUserStatus("online");

          this.router.navigateByUrl('/landing');
        } else {
          // Ha nincs token, hiba
          alert(res.message || 'Login failed!');
        }
      } else {
        // Hibás mezők
        alert('Invalid login fields: ' + this.invalidFields.join(', '));
      }
    },
    error: (err) => {
      alert(err.error?.message || 'Unknown error occurred!');
    }
  });
}


  isInvalid(field: string) {
    return this.invalidFields.includes(field); // Visszaadja, hogy a mező hibás-e
  }
}
