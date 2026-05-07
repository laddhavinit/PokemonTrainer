import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing-component',
  imports: [FormsModule],
  templateUrl: './landing-component.html',
  styleUrl: './landing-component.css',
})
export class LandingComponent {
  trainerName: string = '';

  constructor(private router: Router) {}

  onSubmit() {
    if (this.trainerName.trim()) {
      localStorage.setItem('trainerName', this.trainerName.trim());
      this.router.navigate(['/catalogue']);
    }
  }
}
