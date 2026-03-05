import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { checkPassword } from '../utils/checkPassword.util';

@ValidatorConstraint({ name: 'StrongPassword', async: false })
export class StrongPasswordConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    if (typeof value !== 'string') return false;
    return checkPassword(value).isVaild;
  }

  defaultMessage(args: ValidationArguments): string {
    if (typeof args.value !== 'string') {
      return 'Password must be a string';
    }
    const result = checkPassword(args.value);
    return result.message ?? 'Password is invalid';
  }
}

export function IsStrongPassword(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: StrongPasswordConstraint,
    });
  };
}
