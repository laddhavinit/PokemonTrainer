import { Injectable, signal, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class TrainerService {
  private trainerNameSignal = signal<string>('');
  
  // Public readonly signal
  trainerName = this.trainerNameSignal.asReadonly();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.loadTrainerName();
  }

  private loadTrainerName(): void {
    if (isPlatformBrowser(this.platformId)) {
      const name = localStorage.getItem('trainerName') || '';
      this.trainerNameSignal.set(name);
    }
  }

  setTrainerName(name: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('trainerName', name);
      this.trainerNameSignal.set(name);
    }
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Only clear trainer name, preserve Pokémon data
      localStorage.removeItem('trainerName');
      this.trainerNameSignal.set('');
      // Note: We keep 'caughtPokemon' and 'allPokemon' for when user logs back in
    }
  }

  clearAllData(): void {
    if (isPlatformBrowser(this.platformId)) {
      // This method can be used if we want to completely reset everything
      localStorage.removeItem('trainerName');
      localStorage.removeItem('caughtPokemon');
      sessionStorage.removeItem('allPokemon');
      this.trainerNameSignal.set('');
    }
  }

  isLoggedIn(): boolean {
    return this.trainerName().length > 0;
  }
}