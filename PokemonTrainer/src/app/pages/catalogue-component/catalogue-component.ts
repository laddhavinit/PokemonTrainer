import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PokemonService, Pokemon } from '../../services/pokemon.service';

@Component({
  selector: 'app-catalogue-component',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './catalogue-component.html',
  styleUrl: './catalogue-component.css',
})
export class CatalogueComponent implements OnInit {

  constructor(private pokemonService: PokemonService) {}

  async ngOnInit() {
    await this.pokemonService.loadPokemon();
  }

  get pokemonList() {
    return this.pokemonService.pokemonList();
  }

  catchPokemon(pokemon: Pokemon) {
    this.pokemonService.catchPokemon(pokemon.id);
  }

  releasePokemon(pokemon: Pokemon) {
    this.pokemonService.releasePokemon(pokemon.id);
  }
}