import { Injectable, signal, computed } from '@angular/core';

export interface Pokemon {
  id: number;
  name: string;
  spriteUrl: string;
  caught: boolean;
}

export interface PokemonApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Array<{
    name: string;
    url: string;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class PokemonService {

  private readonly BASE_API_URL = 'https://pokeapi.co/api/v2/pokemon';
  private readonly CAUGHT_KEY = 'caughtPokemon';
  private readonly PAGE_CACHE_KEY = 'pokemonPageCache';
  private readonly TOTAL_COUNT_KEY = 'pokemonTotalCount';
  private readonly CAUGHT_POKEMON_CACHE_KEY = 'caughtPokemonDetailsCache';

  private currentPagePokemonSignal = signal<Pokemon[]>([]);
  private caughtIdsSignal = signal<number[]>([]);
  private totalCountSignal = signal<number>(0);
  private isLoadingSignal = signal<boolean>(false);

  // Public readonly signals
  currentPagePokemon = this.currentPagePokemonSignal.asReadonly();
  totalCount = this.totalCountSignal.asReadonly();
  isLoading = this.isLoadingSignal.asReadonly();
  caughtIds = this.caughtIdsSignal.asReadonly();

  // Computed signal for current page with caught status
  pokemonList = computed(() => {
    const pokemon = this.currentPagePokemonSignal();
    const caughtIds = this.caughtIdsSignal();
    return pokemon.map(p => ({ ...p, caught: caughtIds.includes(p.id) }));
  });

  constructor() {
    this.loadCaughtPokemonIds();
    this.loadTotalCountFromCache();
  }

  async loadPokemonPage(page: number, limit: number = 20): Promise<void> {
    this.isLoadingSignal.set(true);
    
    try {
      // Check if page is cached
      const cachedPage = this.getPageFromCache(page, limit);
      if (cachedPage) {
        console.log(`Loading page ${page} from cache`);
        this.currentPagePokemonSignal.set(cachedPage);
        this.isLoadingSignal.set(false);
        return;
      }

      console.log(`Fetching page ${page} from API`);
      const offset = (page - 1) * limit;
      const url = `${this.BASE_API_URL}?limit=${limit}&offset=${offset}`;
      
      const response = await fetch(url);
      const data: PokemonApiResponse = await response.json();
      
      // Update and cache total count
      this.totalCountSignal.set(data.count);
      this.cacheTotalCount(data.count);
      
      // Process Pokemon data
      const pokemon: Pokemon[] = data.results.map((p: any) => {
        const id = this.extractIdFromUrl(p.url);
        return {
          id,
          name: p.name,
          spriteUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
          caught: false // Will be computed in pokemonList
        };
      });

      // Cache the page data
      this.cachePageData(page, limit, pokemon);
      this.currentPagePokemonSignal.set(pokemon);
    } catch (error) {
      console.error('Error loading Pokemon page:', error);
      this.currentPagePokemonSignal.set([]);
    } finally {
      this.isLoadingSignal.set(false);
    }
  }

  catchPokemon(id: number): void {
    if (typeof localStorage === 'undefined') return;
    
    const trainerName = localStorage.getItem('trainerName');
    if (!trainerName) return;
    
    const key = `${this.CAUGHT_KEY}_${trainerName}`;
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
    
    const key = `${this.CAUGHT_KEY}_${trainerName}`;
    const newCaught = this.caughtIdsSignal().filter(cid => cid !== id);
    localStorage.setItem(key, JSON.stringify(newCaught));
    this.caughtIdsSignal.set(newCaught);
  }

  async getCaughtPokemon(): Promise<Pokemon[]> {
    const caughtIds = this.caughtIdsSignal();
    if (caughtIds.length === 0) return [];

    // Get cached Pokemon data
    const cachedPokemon = this.getCaughtPokemonFromCache();
    const cachedPokemonMap = new Map(cachedPokemon.map(p => [p.id, p]));
    
    // Find which Pokemon we need to fetch
    const missingIds = caughtIds.filter(id => !cachedPokemonMap.has(id));
    
    if (missingIds.length === 0) {
      console.log('Loading all caught Pokemon from session storage cache');
      return caughtIds.map(id => cachedPokemonMap.get(id)!);
    }

    console.log(`Fetching ${missingIds.length} missing Pokemon details from API`);
    const newPokemon: Pokemon[] = [];
    
    // Fetch details for missing Pokemon only
    for (const id of missingIds) {
      try {
        const response = await fetch(`${this.BASE_API_URL}/${id}`);
        const data = await response.json();
        
        const pokemon: Pokemon = {
          id: data.id,
          name: data.name,
          spriteUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${data.id}.png`,
          caught: true
        };
        
        newPokemon.push(pokemon);
        cachedPokemonMap.set(id, pokemon);
      } catch (error) {
        console.error(`Error loading Pokemon ${id}:`, error);
      }
    }
    
    // Update cache with all Pokemon (existing + new)
    const allPokemon = Array.from(cachedPokemonMap.values());
    this.cacheCaughtPokemon(allPokemon);
    
    // Return only the currently caught Pokemon in the correct order
    return caughtIds.map(id => cachedPokemonMap.get(id)!).filter(Boolean);
  }

  private loadCaughtPokemonIds(): void {
    if (typeof localStorage === 'undefined') return;
    
    const trainerName = localStorage.getItem('trainerName');
    if (!trainerName) return;
    
    const key = `${this.CAUGHT_KEY}_${trainerName}`;
    const stored = localStorage.getItem(key);
    const caughtIds = stored ? JSON.parse(stored) : [];
    this.caughtIdsSignal.set(caughtIds);
  }

  // Public method to refresh caught Pokemon IDs (call when trainer logs in)
  refreshCaughtPokemonIds(): void {
    this.loadCaughtPokemonIds();
  }

  private loadTotalCountFromCache(): void {
    if (typeof sessionStorage === 'undefined') return;
    
    const cached = sessionStorage.getItem(this.TOTAL_COUNT_KEY);
    if (cached) {
      this.totalCountSignal.set(Number(cached));
    }
  }

  private cacheTotalCount(count: number): void {
    if (typeof sessionStorage === 'undefined') return;
    sessionStorage.setItem(this.TOTAL_COUNT_KEY, count.toString());
  }

  private getPageFromCache(page: number, limit: number): Pokemon[] | null {
    if (typeof sessionStorage === 'undefined') return null;
    
    const cacheKey = `${this.PAGE_CACHE_KEY}_${page}_${limit}`;
    const cached = sessionStorage.getItem(cacheKey);
    
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (error) {
        console.error('Error parsing cached page data:', error);
        return null;
      }
    }
    
    return null;
  }

  private cachePageData(page: number, limit: number, pokemon: Pokemon[]): void {
    if (typeof sessionStorage === 'undefined') return;
    
    const cacheKey = `${this.PAGE_CACHE_KEY}_${page}_${limit}`;
    try {
      sessionStorage.setItem(cacheKey, JSON.stringify(pokemon));
    } catch (error) {
      console.error('Error caching page data:', error);
    }
  }

  clearPageCache(): void {
    if (typeof sessionStorage === 'undefined') return;
    
    // Remove all cached pages and caught Pokemon
    const keys = Object.keys(sessionStorage);
    keys.forEach(key => {
      if (key.startsWith(this.PAGE_CACHE_KEY) || 
          key === this.TOTAL_COUNT_KEY || 
          key.startsWith(this.CAUGHT_POKEMON_CACHE_KEY)) {
        sessionStorage.removeItem(key);
      }
    });
  }

  private getCaughtPokemonFromCache(): Pokemon[] {
    if (typeof sessionStorage === 'undefined') return [];
    
    const trainerName = localStorage.getItem('trainerName');
    if (!trainerName) return [];
    
    const cacheKey = `${this.CAUGHT_POKEMON_CACHE_KEY}_${trainerName}`;
    const cached = sessionStorage.getItem(cacheKey);
    
    if (cached) {
      try {
        const cachedData = JSON.parse(cached);
        return cachedData.pokemon || [];
      } catch (error) {
        console.error('Error parsing cached caught Pokemon data:', error);
        return [];
      }
    }
    
    return [];
  }

  private cacheCaughtPokemon(pokemon: Pokemon[]): void {
    if (typeof sessionStorage === 'undefined') return;
    
    const trainerName = localStorage.getItem('trainerName');
    if (!trainerName) return;
    
    const cacheKey = `${this.CAUGHT_POKEMON_CACHE_KEY}_${trainerName}`;
    const cacheData = {
      pokemon: pokemon,
      ids: pokemon.map(p => p.id),
      timestamp: Date.now()
    };
    
    try {
      sessionStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error caching caught Pokemon data:', error);
    }
  }

  private extractIdFromUrl(url: string): number {
    const parts = url.split('/').filter(Boolean);
    return Number(parts[parts.length - 1]);
  }
}