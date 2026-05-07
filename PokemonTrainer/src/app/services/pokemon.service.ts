import { Injectable, signal, computed } from '@angular/core';

export interface Pokemon {
  id: number;
  name: string;
  spriteUrl: string;
  caught: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PokemonService {

  private readonly API_URL = 'https://pokeapi.co/api/v2/pokemon?limit=200&offset=0';
  private readonly SESSION_KEY = 'allPokemon';
  private readonly CAUGHT_KEY = 'caughtPokemon';

  private pokemonListSignal = signal<Pokemon[]>([]);
  private caughtIdsSignal = signal<number[]>([]);

  // Computed signals that auto-update when dependencies change
  pokemonList = computed(() => {
    const allPokemon = this.pokemonListSignal();
    const caughtIds = this.caughtIdsSignal();
    return allPokemon.map(p => ({ ...p, caught: caughtIds.includes(p.id) }));
  });

  caughtPokemon = computed(() => this.pokemonList().filter(p => p.caught));

  async loadPokemon(): Promise<void> {
    // Load caught IDs from localStorage
    this.caughtIdsSignal.set(this.getCaughtPokemonIds());

    const cached = sessionStorage.getItem(this.SESSION_KEY);
    
    if (cached) {
      this.pokemonListSignal.set(JSON.parse(cached));
      return;
    }

    const response = await fetch(this.API_URL);
    const data = await response.json();

    const pokemon: Pokemon[] = data.results.map((p: any) => {
      const id = this.extractIdFromUrl(p.url);
      return {
        id,
        name: p.name,
        spriteUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
        caught: false // Will be computed automatically
      };
    });

    sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(pokemon));
    this.pokemonListSignal.set(pokemon);
  }

  private getCaughtPokemonIds(): number[] {
    if (typeof localStorage === 'undefined') return [];
    
    const trainerName = localStorage.getItem('trainerName');
    if (!trainerName) return [];
    
    const key = `caughtPokemon_${trainerName}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  }

  catchPokemon(id: number): void {
    if (typeof localStorage === 'undefined') return;
    
    const trainerName = localStorage.getItem('trainerName');
    if (!trainerName) return;
    
    const key = `caughtPokemon_${trainerName}`;
    const currentCaught = this.caughtIdsSignal();
    if (!currentCaught.includes(id)) {
      const newCaught = [...currentCaught, id];
      localStorage.setItem(key, JSON.stringify(newCaught));
      this.caughtIdsSignal.set(newCaught);
    }
  }

  releasePokemon(id: number): void {
    if (typeof localStorage === 'undefined') return;
    
    const trainerName = localStorage.getItem('trainerName');
    if (!trainerName) return;
    
    const key = `caughtPokemon_${trainerName}`;
    const newCaught = this.caughtIdsSignal().filter(cid => cid !== id);
    localStorage.setItem(key, JSON.stringify(newCaught));
    this.caughtIdsSignal.set(newCaught);
  }

  private extractIdFromUrl(url: string): number {
    const parts = url.split('/').filter(Boolean);
    return Number(parts[parts.length - 1]);
  }
}