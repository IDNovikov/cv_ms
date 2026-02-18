type PasswordValidationError =
  | 'ONLY_LATIN_NUM_SYMBOL'
  | 'TOO_SHORT'
  | 'UPPER_AND_LOWER_REQUIRED'
  | 'NUMBER_REQUIRED'
  | 'SYMBOL_REQUIRED'
  | 'REPEATING_CHARS';

type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

export class Password {
  private constructor(private readonly _password: string) {}

  get password() {
    return this._password;
  }

  static setPass(pass: string): Result<Password, PasswordValidationError> {
    const err = Password.validate(pass);
    if (err) return { ok: false, error: err };
    return { ok: true, value: new Password(pass) };
  }

static changePass(newPass:)



  private static validate(password: string): PasswordValidationError | null {
    const onlyLatinNumbersAndSymbol =
      /^[A-Za-z0-9!@#$%^&*()_\-+=\[{\]};:'",<.>/?~|\\]*$/;
    const upperAndLower = /^(?=.*[a-z])(?=.*[A-Z]).+$/;
    const oneNumber = /^(?=.*\d).+$/;
    const symbol = /^(?=.*[!@#$%^&*()_\-+=\[{\]};:'",<.>/?~|\\]).+$/;
    const noThreeRepeats = /^(?!.*(.)\1{2,}).+$/;

    if (!onlyLatinNumbersAndSymbol.test(password))
      return 'ONLY_LATIN_NUM_SYMBOL';
    if (password.length < 8) return 'TOO_SHORT';
    if (!upperAndLower.test(password)) return 'UPPER_AND_LOWER_REQUIRED';
    if (!oneNumber.test(password)) return 'NUMBER_REQUIRED';
    if (!symbol.test(password)) return 'SYMBOL_REQUIRED';
    if (!noThreeRepeats.test(password)) return 'REPEATING_CHARS';

    return null;
  }
}
