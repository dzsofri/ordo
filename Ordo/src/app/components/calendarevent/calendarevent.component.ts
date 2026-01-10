import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-calendarevent',
  imports: [FormsModule, CommonModule],
  templateUrl: './calendarevent.component.html',
  styleUrl: './calendarevent.component.scss'
})
export class CalendareventComponent {
     dummyEvent = {
    title: 'Csurmiii',
    date: '2026.04.12',
    time: '20:15',
    description: `Ez egy dummy esemény leírása, ami szándékosan hosszú,
    hogy kipróbálható legyen a 150 karakteres vágás. Itt még mindig megy a
    szöveg, hogy biztos átlépje a limitet és megjelenjen a három pont a végén.`
  };


    dummyEvent1 = {
    title: 'Csurmiii',
    date: '2026.04.12',
    time: '20:15',
    description: `Ez egy dummy esemény leírása, ami szándékosan hosszú,
    hogy kipróbálható legyen a 150.`
  };

}
