import { Component } from '@angular/core';

@Component({
  selector: 'app-settings',
  standalone: true,
  template: `
    <h2>Settings</h2>
    <p>Manage your application settings here.</p>
  `,
  styles: [
    `
      h2 {
        color: #3f51b5;
      }
    `,
  ],
})
export class SettingsComponent {}