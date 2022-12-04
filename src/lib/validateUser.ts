import bcrypt from 'bcrypt';

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

export function isUserType(type) {
  return typeof type === 'string' && userTypes.includes(type);
}

export default function validateUser<
  T extends AuthType.SignInBody | AuthType.SignUpBody,
>(user: T): T {
  if (!emailReg.test(user.email)) {
    throw new Error('Email field is not an email');
  }

  if (!passwordReg.test(user.password)) {
    throw new Error(
      'Password must be at least 6 characters, contain one number and one uppercase letter',
    );
  }

  const salt = bcrypt.genSaltSync();

  const password = bcrypt.hashSync(user.password, salt);

  user.password = password;

  return user;
}
