import { Request, Response } from 'express';

export class RefreshSessionCommand {
  constructor(
    public readonly request: Request,
    public readonly response: Response,
  ) {}
}
