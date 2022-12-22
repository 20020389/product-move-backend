declare type User = import('@prisma/client').User;
declare type Token = import('@prisma/client').Token;

declare type NestRequest = import('express').Request & {
  user?: User;
  token?: string;
};
type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };
