import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class LandingGuard implements CanActivate {

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  canActivate(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      const trainerName = localStorage.getItem('trainerName');
      
      if (trainerName && trainerName.trim()) {
        // User is already logged in, redirect to catalogue
        this.router.navigate(['/catalogue']);
        return false;
      }
    }
    
    // Allow access to landing page if not logged in
    return true;
  }
}