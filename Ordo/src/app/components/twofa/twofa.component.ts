import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-twofa',
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './twofa.component.html',
  styleUrl: './twofa.component.scss'
})
export class TwofaComponent {
onSubmit() {}

code: string[] = ['', '', '', '', '', ''];

moveFocus(event: any, nextIndex: number) {
  const input = event.target;
  const value = input.value;

  if(value.length === 1 && nextIndex < 6) {
    const nextInput = input.parentElement?.children[nextIndex] as HTMLElement;
    nextInput.focus();
  } else if (value.length === 0 && nextIndex > 0) {
    // ha töröl, vissza lehet menni
    const prevInput = input.parentElement?.children[nextIndex-2] as HTMLElement;
    prevInput?.focus();
  }
}

}
