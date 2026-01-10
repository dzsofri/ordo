import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
  imports: [FormsModule, CommonModule],
})
export class CalendarComponent implements OnInit {
  year!: number;
  month!: number; // 0-11
  dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  firstDay!: number;
  daysInMonth!: number;

  events: any[] = [
    { day: 5, title: 'Meeting', time: '10:00', color: 'red' },
    { day: 12, title: 'Lunch', time: '12:30', color: 'blue' },
  ];

  ngOnInit() {
    const today = new Date();
    this.year = today.getFullYear();
    this.month = today.getMonth();
    this.updateCalendar();
  }

  updateCalendar() {
    const first = new Date(this.year, this.month, 1);
    this.firstDay = first.getDay(); // hét első napja (0 = Sunday)
    this.daysInMonth = new Date(this.year, this.month + 1, 0).getDate(); // napok száma
  }

  prevMonth() {
    this.month--;
    if (this.month < 0) {
      this.month = 11;
      this.year--;
    }
    this.updateCalendar();
  }

  nextMonth() {
    this.month++;
    if (this.month > 11) {
      this.month = 0;
      this.year++;
    }
    this.updateCalendar();
  }

  eventsForDay(day: number) {
    return this.events.filter(e => e.day === day);
  }
}
