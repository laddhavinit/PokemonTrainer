import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { TrainerService } from '@services/trainer.service';
import { PokemonService } from '@services/pokemon.service';

declare var bootstrap: any;

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class Header {

  constructor(
    private router: Router,
    private trainerService: TrainerService,
    private pokemonService: PokemonService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  get trainerName() {
    return this.trainerService.trainerName() || 'Trainer';
  }

  get caughtCount() {
    return this.pokemonService.caughtIds().length;
  }

  showLogoutModal() {
    if (isPlatformBrowser(this.platformId)) {
      const modal = new bootstrap.Modal(document.getElementById('logoutModal'));
      modal.show();
    }
  }

  confirmLogout() {
    if (isPlatformBrowser(this.platformId)) {
      this.trainerService.logout();
      this.pokemonService.clearPageCache(); // Clear cached pages on logout
      this.router.navigate(['/']);
    }
  }
}