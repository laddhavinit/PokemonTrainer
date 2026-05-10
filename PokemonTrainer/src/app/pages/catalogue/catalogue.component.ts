import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PokemonService, Pokemon } from '@services/pokemon.service';

declare var bootstrap: any;

@Component({
  selector: 'app-catalogue',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './catalogue.component.html',
  styleUrl: './catalogue.component.scss',
})
export class CatalogueComponent implements OnInit {
  currentPage = 1;
  itemsPerPage = 20;
  Math = Math; // Make Math available in template
  selectedPokemon = signal<Pokemon | null>(null);

  constructor(private pokemonService: PokemonService) {}

  async ngOnInit() {
    // Refresh caught Pokemon IDs for the current trainer
    this.pokemonService.refreshCaughtPokemonIds();
    await this.loadCurrentPage();
  }

  private async loadCurrentPage() {
    await this.pokemonService.loadPokemonPage(this.currentPage, this.itemsPerPage);
  }

  get pokemonList() {
    return this.pokemonService.pokemonList();
  }

  get totalPokemon() {
    return this.pokemonService.totalCount();
  }

  get totalPages() {
    return Math.ceil(this.totalPokemon / this.itemsPerPage);
  }

  get caughtCount() {
    return this.pokemonService.caughtIds().length;
  }

  get isLoading() {
    return this.pokemonService.isLoading();
  }

  async goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      await this.loadCurrentPage();
      // Scroll to top when changing pages
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  async previousPage() {
    await this.goToPage(this.currentPage - 1);
  }

  async nextPage() {
    await this.goToPage(this.currentPage + 1);
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);
    
    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  catchPokemon(pokemon: Pokemon) {
    this.pokemonService.catchPokemon(pokemon.id);
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
}