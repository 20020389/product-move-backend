declare namespace AuthType {
  export type SignUpBody = Omit<Omit<User, 'tokens'>, 'type'> & {
    type: string | null;
  };
  export type SignUpResponse = {
    accessToken: string;
  };

  export type SignInBody = {
    email: string;
    password: string;
  };
}
