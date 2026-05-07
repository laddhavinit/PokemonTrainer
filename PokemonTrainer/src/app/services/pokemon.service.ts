import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable,  of } from 'rxjs';
import { map, tap } from 'rxjs/operators';

export interface Pokemon {
  id: number;
  name: string;
  spriteUrl: string;
}

@Injectable({
  providedIn: 'root'
})
export class PokemonService {

  private readonly API_URL = 'https://pokeapi.co/api/v2/pokemon?limit=200&offset=0';
  private readonly SESSION_KEY = 'allPokemon';

  constructor(private http: HttpClient) {}

  getAllPokemon(): Observable<Pokemon[]> {
    const cached = sessionStorage.getItem(this.SESSION_KEY);

    if (cached) {
      console.log('Loaded from sessionStorage');
      return of(JSON.parse(cached));
    }

    return this.http.get<any>(this.API_URL).pipe(
      map((response) => {
        return response.results.map((p: any) => {
          const id = this.extractIdFromUrl(p.url);
          return {
            id,
            name: p.name,
            spriteUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`
          };
        });
      }),
      tap((pokemon: Pokemon[]) => {
        sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(pokemon));
        console.log('Fetched from PokéAPI and cached in sessionStorage');
      })
    );
  }

  private extractIdFromUrl(url: string): number {
    const parts = url.split('/').filter(Boolean);
    return Number(parts[parts.length - 1]);
  }
}