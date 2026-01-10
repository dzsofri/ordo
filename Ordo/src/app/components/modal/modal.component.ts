import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
})
export class ModalComponent {
  // Modal paraméterek
  @Input() title: string = 'Modal Title';
  @Input() message: string = 'Your message goes here.';
  @Input() showCancel: boolean = true;
  @Input() type: 'success' | 'error' | 'info' | 'warning' = 'info';

  // Események a szülő komponens felé
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  // Láthatóság kezelése
  isVisible: boolean = false;

  // Modal megnyitása
  open() {
    this.isVisible = true;
  }

  // Modal bezárása
  close() {
    this.isVisible = false;
  }

  // Confirm gomb
  onConfirm() {
    this.confirm.emit(); // értesíti a szülőt
    this.close();         // bezárja a modalt
  }

  // Cancel gomb
  onCancel() {
    this.cancel.emit();  // értesíti a szülőt
    this.close();        // bezárja a modalt
  }
}
