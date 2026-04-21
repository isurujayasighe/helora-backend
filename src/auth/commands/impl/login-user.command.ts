import { Request, Response } from 'express';

export class LoginUserCommand {
  constructor(
    public readonly request: Request,
    public readonly response: Response,
  ) {}
}
