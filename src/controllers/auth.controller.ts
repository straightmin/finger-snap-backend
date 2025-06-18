// src/controllers/auth.controller.ts
import { Request, Response } from "express";

const healthCheck = {
    status: "ok",
    timestamp: new Date().toISOString(),
};

const myInfo = {
    id: 1,
    username: "straightmin",
    email: "straightmin@gmail.com",
};

export const register = (req: Request, res: Response) => {
    res.send("register");
};
export const login = (req: Request, res: Response) => {
    res.send("login");
};
export const me = (req: Request, res: Response) => {
    res.send(myInfo);
};
export const ping = (req: Request, res: Response) => {
    res.send("pong");
};
export const health = (req: Request, res: Response) => {
    res.send(healthCheck);
};
