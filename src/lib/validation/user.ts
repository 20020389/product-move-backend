import { literal, object, optional, refine, size, string } from 'superstruct';

export const userTypes = [
  'normal_user', // người mua
  'admin', //quản lý
  'factory', // người sản xuất
  'distribution', // người phân phối
  'insurance',
];

export const emailReg =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export const passwordReg = /^(?=.*[0-9])(?=.*[A-Z])[a-zA-Z0-9]{6,16}$/;

export function isEmail(v: string) {
  if (!emailReg.test(v)) {
    return 'Email field is not an email';
  }
  return true;
}

export function isPassword(v: string) {
  if (!passwordReg.test(v)) {
    return 'Password must be at least 6 characters, contain one number and one uppercase letter';
  }
  return true;
}

export function isUserType(v: string) {
  if (!userTypes.includes(v)) {
    return "type field is not a user's type";
  }
  return true;
}

export const UserValidation = object({
  email: refine(string(), 'email', isEmail),
  password: refine(size(string(), 6, 15), 'password', isPassword),
  name: optional(size(string(), 3, 30)),
  type: optional(literal(userTypes)),
});
