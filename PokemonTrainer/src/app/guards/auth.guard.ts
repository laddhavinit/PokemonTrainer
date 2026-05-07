import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  canActivate(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      const trainerName = localStorage.getItem('trainerName');
      
      if (trainerName && trainerName.trim()) {
        return true; // Allow access
      } else {
        this.router.navigate(['/']); // Redirect to landing page
        return false;
      }
    }
    
    // Allow access during SSR to prevent issues
    return true;
  }
}