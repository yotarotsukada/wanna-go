export class ThemeNotFoundError extends Error {
  constructor(themeId: string) {
    super(`Theme with id ${themeId} not found`);
    this.name = "ThemeNotFoundError";
  }
}

export class ThemeValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ThemeValidationError";
  }
}