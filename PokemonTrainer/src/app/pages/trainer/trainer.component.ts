import { Component, OnInit, Inject, PLATFORM_ID, computed, signal, effect } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PokemonService, Pokemon } from '@services/pokemon.service';

declare var bootstrap: any;

@Component({
  selector: 'app-trainer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './trainer.component.html',
  styleUrl: './trainer.component.scss',
})
export class TrainerComponent implements OnInit {
  trainerName: string = '';
  private caughtPokemonSignal = signal<Pokemon[]>([]);
  private isLoadingSignal = signal<boolean>(false);
  selectedPokemon = signal<Pokemon | null>(null);
  
  // Computed signals
  pokemonList = computed(() => this.caughtPokemonSignal());
  isLoading = computed(() => this.isLoadingSignal());
  
  get caughtCount() {
    return this.pokemonService.caughtIds().length;
  }

  constructor(
    private pokemonService: PokemonService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Effect to reload caught Pokémon when caught IDs change
    effect(async () => {
      const caughtIds = this.pokemonService.caughtIds();
      if (isPlatformBrowser(this.platformId)) {
        await this.loadCaughtPokemon();
      }
    });
  }

  async ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.trainerName = localStorage.getItem('trainerName') || 'Unknown Trainer';
      // Refresh caught Pokemon IDs for the current trainer
      // The effect() will automatically call loadCaughtPokemon() when IDs change
      this.pokemonService.refreshCaughtPokemonIds();
    }
  }

  private async loadCaughtPokemon() {
    this.isLoadingSignal.set(true);
    try {
      const caughtPokemon = await this.pokemonService.getCaughtPokemon();
      this.caughtPokemonSignal.set(caughtPokemon);
    } catch (error) {
      console.error('Error loading caught Pokémon:', error);
      this.caughtPokemonSignal.set([]);
    } finally {
      this.isLoadingSignal.set(false);
    }
  }

  showReleaseModal(pokemon: Pokemon) {
    this.selectedPokemon.set(pokemon);
    const modal = new bootstrap.Modal(document.getElementById('releaseModal'));
    modal.show();
  }

  confirmRelease() {
    const pokemon = this.selectedPokemon();
    if (pokemon) {
      this.pokemonService.releasePokemon(pokemon.id);
      this.selectedPokemon.set(null);
    }
  }

  showReleaseAllModal() {
    const modal = new bootstrap.Modal(document.getElementById('releaseAllModal'));
    modal.show();
  }

  confirmReleaseAll() {
    for (const pokemon of this.pokemonList()) {
      this.pokemonService.releasePokemon(pokemon.id);
    }
  }
}