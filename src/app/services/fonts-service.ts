import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FontService {

  constructor() {}

  getAvailableFonts(): Promise<string[]> {
    return new Promise((resolve) => {
      const fonts: string[] = [];

      // Use the browser's font detection API
      document.fonts.forEach((font) => {
        fonts.push(`${font.family} ${font.style}`);
      });

      resolve(fonts);
    });
  }
}
