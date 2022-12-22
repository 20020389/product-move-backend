import { Request } from 'express';

export function getServerUrl(req: Request) {
  const protocol = req.protocol;
  const host = req.hostname;

  return `${protocol}//${host}`;
}
