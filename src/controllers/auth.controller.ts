// src/controllers/auth.controller.ts
import { Request, Response } from 'express';

export const register = (req: Request, res: Response) => {res.send('register')};
export const login    = (req: Request, res: Response) => {res.send('login')};
export const me       = (req: Request, res: Response) => {res.send('me')};
export const ping     = (req: Request, res: Response) => {res.send('pong')};