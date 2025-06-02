import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <div class="main-container">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    .main-container {
      min-height: 100vh;
    }
  `]
})
export class AppComponent {
  title = 'BudgetMaster';
}
