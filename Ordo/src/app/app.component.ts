import { CommonModule, NgClass } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule,],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})

 export class AppComponent implements OnInit {
 

  constructor(private router: Router) {}



  ngOnInit() {
    // Figyeljük a navigációs eseményeket, és ennek megfelelően döntünk a sidebar megjelenítéséről
   
  }

  title = 'TrackIt';
}
