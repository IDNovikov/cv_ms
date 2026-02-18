// import {
//   ValidationArguments,
//   ValidatorConstraint,
//   ValidatorConstraintInterface,
// } from 'class-validator';

// @ValidatorConstraint({ name: 'IdentifierValidator', async: false })
// export class IdentifierValidator implements ValidatorConstraintInterface {
//   public validate(value: string, args: ValidationArguments): boolean {

// //

//     const obj = args.object as LoginUserRequest;

//     if (obj.type === 'email') {
//       return (
//         typeof value === 'string' && /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(value)
//       );
//     } else if (obj.type === 'userName' && value.length > 3) {
//       return true;
//     }
//     return false;
//   }

//   public defaultMessage(args: ValidationArguments): string {
//     const obj = args.object as LoginUserRequest;
//     if (obj.type === 'email') {
//       return 'Identifier must be a valid email';
//     }
//     if (obj.type === 'userName') {
//       return 'Identifier must be a valid user name';
//     }

//     return 'Invalid identifier';
//   }
// }
