import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PokemonService, Pokemon } from '../../services/pokemon.service';

@Component({
  selector: 'app-trainer-component',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './trainer-component.html',
  styleUrl: './trainer-component.css',
})
export class TrainerComponent implements OnInit {
  trainerName: string = '';

  constructor(
    private pokemonService: PokemonService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  async ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.trainerName = localStorage.getItem('trainerName') || 'Unknown Trainer';
      await this.pokemonService.loadPokemon();
    }
  }

  get pokemonList() {
    return this.pokemonService.caughtPokemon();
  }

  releasePokemon(pokemon: Pokemon) {
    this.pokemonService.releasePokemon(pokemon.id);
  }

  releaseAll() {
    if (confirm('Are you sure you want to release all your Pokémon? This action cannot be undone.')) {
      this.pokemonList.forEach(pokemon => {
        this.pokemonService.releasePokemon(pokemon.id);
      });
    }
  }
}