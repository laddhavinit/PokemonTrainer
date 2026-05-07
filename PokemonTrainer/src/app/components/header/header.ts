import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { TrainerService } from '../../services/trainer.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {

  constructor(
    private router: Router,
    private trainerService: TrainerService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  get trainerName() {
    return this.trainerService.trainerName() || 'Trainer';
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      const confirmed = confirm('Are you sure you want to logout?');
      if (confirmed) {
        this.trainerService.logout();
        this.router.navigate(['/']);
      }
    }
  }
}