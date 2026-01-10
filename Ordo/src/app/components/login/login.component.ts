import { Component, ViewChild } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { User } from '../../interfaces/user';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ModalComponent } from '../modal/modal.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule, ModalComponent],
})
export class LoginComponent {

  @ViewChild('modal') modal!: ModalComponent;

  user: User = { email: '', password: '' };
  showPassword = false;
  invalidFields: string[] = [];

  // Modal állapotok
  modalType: 'success' | 'error' | 'warning' | 'info' = 'info';
  modalMessage = '';

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private router: Router
  ) {}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  // Form submit
  onSubmit() {
    this.invalidFields = [];

    this.api.login(this.user.email, this.user.password).subscribe({
      next: (res: any) => {
        this.invalidFields = res.invalid || [];

        if (this.invalidFields.length === 0) {
          if (res.token) {
            this.auth.login(res.token);

            // Sikeres login modal
            this.modalType = 'success';
            this.modalMessage = res.message || 'Login successful!';
            this.modal.open();
          } else {
            // Token nélkül hiba modal
            this.modalType = 'error';
            this.modalMessage = res.message || 'Login failed!';
            this.modal.open();
          }
        } else {
          // Hibás mezők modal 
          this.modalType = 'warning';
          this.modalMessage = 'Invalid login fields: ' + this.invalidFields.join(', ');
          this.modal.open();
        }
      },
      error: (err) => {
        this.modalType = 'error';
        this.modalMessage = err.error?.message || 'Unknown error occurred!';
        this.modal.open();
      }
    });
  }

  // Modal confirm
  onConfirm() {
    this.modal.close();
    if (this.modalType === 'success') {
      // Sikeres login után navigálás
      this.router.navigateByUrl('/twofa');
    }
  }

  // Modal cancel
  onCancel() {
    this.modal.close();
    console.log('User cancelled modal');
  }
}
