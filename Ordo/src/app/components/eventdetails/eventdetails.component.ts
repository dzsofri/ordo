import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-eventdetails',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './eventdetails.component.html',
styleUrls: ['./eventdetails.component.scss'] // <-- javítva 
})
export class EventdetailsComponent {
/* @Input() event = {
    type: 'Game Event',
    title: 'Event Name',
    description: 'Initial consultation with new client about their requirements.',
    deadline: 'May 19, 2025 – 5:00 PM',
    link: 'https://eventlink.com'
  };

  @Output() closed = new EventEmitter<void>();

  close() {
    this.closed.emit();
  }*/

showModal =  false ; // itt tároljuk, hogy látható-e
  event = {
    type: 'Meeting',
    title: 'Project Kickoff',
    description: 'Discuss project goals and timeline.',
    deadline: '2026-01-15',
    link: 'https://example.com'
  };

  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }
}
