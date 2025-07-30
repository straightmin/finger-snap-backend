// src/routes/auth.routes.ts
import { Router } from "express";
import {
    register,
    login,
    me,
    health,
    ping,
    logout,
} from "../controllers/auth.controller";
import { authenticateToken } from "../middlewares/auth.middleware";
import { validateSchema, commonSchemas } from "../utils/validation";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication, registration, and session management
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - username
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address.
 *               username:
 *                 type: string
 *                 description: User's unique username.
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User's password (min 8 characters).
 *     responses:
 *       201:
 *         description: User registered successfully.
 *       400:
 *         description: Invalid input, or email/username already exists.
 */
router.post("/register", validateSchema(commonSchemas.userRegister), register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Log in a user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's registered email.
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User's password.
 *     responses:
 *       200:
 *         description: Login successful, returns JWT token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT token for authenticating subsequent requests.
 *       401:
 *         description: Invalid credentials.
 */
router.post("/login", validateSchema(commonSchemas.userLogin), login);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Log out the current user
 *     tags: [Authentication]
 *     description: Clears the authentication cookie.
 *     responses:
 *       200:
 *         description: Logout successful.
 */
router.post("/logout", logout);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current user's profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved user profile.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 email:
 *                   type: string
 *                 username:
 *                   type: string
 *       401:
 *         description: Unauthorized, token is missing or invalid.
 */
router.get("/me", authenticateToken, me);

/**
 * @swagger
 * /auth/ping:
 *   get:
 *     summary: Check server connectivity
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Server is responding.
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: pong
 */
router.get("/ping", ping);

/**
 * @swagger
 * /auth/health:
 *   get:
 *     summary: Check server and database health
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Server and database are healthy.
 *       500:
 *         description: Database connection failed.
 */
router.get("/health", health);

export default router;