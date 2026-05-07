import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TrainerService } from '../../services/trainer.service';

@Component({
  selector: 'app-landing-component',
  imports: [FormsModule],
  templateUrl: './landing-component.html',
  styleUrl: './landing-component.css',
})
export class LandingComponent {
  trainerName: string = '';

  constructor(
    private router: Router,
    private trainerService: TrainerService
  ) {}

  onSubmit() {
    if (this.trainerName.trim()) {
      this.trainerService.setTrainerName(this.trainerName.trim());
      this.router.navigate(['/catalogue']);
    }
  }
}
