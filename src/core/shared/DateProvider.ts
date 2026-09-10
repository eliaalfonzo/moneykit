/**
 * Puerto para obtener la hora actual. Permite congelar el tiempo en tests
 * sin tocar `Date` global (Dependency Inversion).
 */
export interface DateProvider {
  now(): Date;
}

export class SystemDateProvider implements DateProvider {
  now(): Date {
    return new Date();
  }
}
