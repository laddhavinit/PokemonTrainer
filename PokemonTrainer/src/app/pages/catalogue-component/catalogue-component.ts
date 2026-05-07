import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { PokemonService, Pokemon } from '../../services/pokemon.service';

@Component({
  selector: 'app-catalogue-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './catalogue-component.html',
  styleUrl: './catalogue-component.css',
})
export class CatalogueComponent implements OnInit{
  pokemonList: Pokemon[] = [];

  constructor(private pokemonService: PokemonService) {}

  ngOnInit() {
    this.pokemonService.getAllPokemon().subscribe({
      next: (data) => {
        this.pokemonList = data;
        console.log('Pokémon loaded:', this.pokemonList);
      },
      error: (err) => console.error('Error fetching Pokémon:', err)
    });
  }
}
