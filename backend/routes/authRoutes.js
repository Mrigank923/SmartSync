// routes/authRoutes.js
const express = require('express');
const router  = express.Router();
const authCtrl = require('../controllers/authController');
const auth = require('../middleware/auth'); // Added auth middleware
const { authLimiter, loginFailureLimiter } = require('../middleware/rateLimiter');

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *         - name
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated MongoDB ObjectId of the user
 *           example: "507f1f77bcf86cd799439011"
 *         name:
 *           type: string
 *           description: The user's full name
 *           example: "John Doe"
 *         email:
 *           type: string
 *           format: email
 *           description: The user's email address (must be unique)
 *           example: "john.doe@example.com"
 *         isVerified:
 *           type: boolean
 *           description: Whether the user's email has been verified via OTP
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the user account was created
 *           example: "2024-01-15T10:30:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the user account was last updated
 *           example: "2024-01-15T10:30:00.000Z"
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *       properties:
 *         name:
 *           type: string
 *           minLength: 2
 *           maxLength: 50
 *           description: User's full name (2-50 characters)
 *           example: "John Doe"
 *         email:
 *           type: string
 *           format: email
 *           description: Valid email address (must be unique)
 *           example: "john.doe@example.com"
 *         password:
 *           type: string
 *           format: password
 *           minLength: 6
 *           maxLength: 128
 *           description: Secure password (minimum 6 characters)
 *           example: "SecurePassword123!"
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: Registered email address
 *           example: "john.doe@example.com"
 *         password:
 *           type: string
 *           format: password
 *           description: User's password
 *           example: "SecurePassword123!"
 *     VerifyOtpRequest:
 *       type: object
 *       required:
 *         - email
 *         - otp
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: Email address used during registration
 *           example: "john.doe@example.com"
 *         otp:
 *           type: string
 *           pattern: '^[0-9]{6}$'
 *           description: 6-digit OTP sent to the user's email
 *           example: "123456"
 *     AuthResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         token:
 *           type: string
 *           description: JWT token for authentication (valid for 24 hours)
 *           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *         user:
 *           $ref: '#/components/schemas/User'
 *         message:
 *           type: string
 *           description: Success message
 *           example: "Login successful"
 */

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User registration, login, and email verification endpoints
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user account
 *     description: |
 *       Creates a new user account and sends a verification OTP to the provided email address.
 *       
 *       **Process:**
 *       1. Validates the input data (name, email, password)
 *       2. Checks if email is already registered
 *       3. Hashes the password securely
 *       4. Creates user account with `isVerified: false`
 *       5. Sends 6-digit OTP to the email address
 *       6. Returns success message
 *       
 *       **Next Steps:**
 *       - User must verify their email using the `/auth/verify-otp` endpoint
 *       - Only verified users can login to the system
 *       
 *       **Security Notes:**
 *       - Password is hashed using bcrypt
 *       - Email must be unique across the system
 *       - OTP expires after 10 minutes
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *           examples:
 *             validRegistration:
 *               summary: Valid registration data
 *               value:
 *                 name: "John Doe"
 *                 email: "john.doe@example.com"
 *                 password: "SecurePassword123!"
 *             invalidEmail:
 *               summary: Invalid email format
 *               value:
 *                 name: "John Doe"
 *                 email: "invalid-email"
 *                 password: "password123"
 *     responses:
 *       201:
 *         description: User registered successfully, OTP sent to email
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Registration successful. Please check your email for OTP verification."
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request - validation error or user already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               emailExists:
 *                 summary: Email already registered
 *                 value:
 *                   success: false
 *                   message: "Email already registered"
 *                   status: 400
 *               validationError:
 *                 summary: Validation errors
 *                 value:
 *                   success: false
 *                   message: "Validation failed"
 *                   status: 400
 *                   errors:
 *                     - field: "email"
 *                       message: "Invalid email format"
 *                     - field: "password"
 *                       message: "Password must be at least 6 characters"
 *       500:
 *         description: Internal server error
 */
router.post('/register', authLimiter, authCtrl.register);

/**
 * @swagger
 * /auth/verify-otp:
 *   post:
 *     summary: Verify email address with OTP
 *     description: |
 *       Verifies the user's email address using the 6-digit OTP sent during registration.
 *       
 *       **Process:**
 *       1. Validates the email and OTP
 *       2. Checks if OTP is valid and not expired
 *       3. Updates user's `isVerified` status to `true`
 *       4. Returns success message
 *       
 *       **Important Notes:**
 *       - OTP expires after 10 minutes
 *       - User can request a new OTP if needed
 *       - Only verified users can login to the system
 *       
 *       **After Verification:**
 *       - User can now login using `/auth/login` endpoint
 *       - User can access all protected endpoints
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VerifyOtpRequest'
 *           examples:
 *             validOtp:
 *               summary: Valid OTP verification
 *               value:
 *                 email: "john.doe@example.com"
 *                 otp: "123456"
 *             invalidOtp:
 *               summary: Invalid OTP
 *               value:
 *                 email: "john.doe@example.com"
 *                 otp: "000000"
 *     responses:
 *       200:
 *         description: Email verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Email verified successfully. You can now login."
 *       400:
 *         description: Bad request - invalid OTP or email
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               invalidOtp:
 *                 summary: Invalid or expired OTP
 *                 value:
 *                   success: false
 *                   message: "Invalid or expired OTP"
 *                   status: 400
 *               userNotFound:
 *                 summary: User not found
 *                 value:
 *                   success: false
 *                   message: "User not found"
 *                   status: 400
 *       500:
 *         description: Internal server error
 */
router.post('/verify-otp', authCtrl.verifyOtp);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user and get JWT token
 *     description: |
 *       Authenticates a user and returns a JWT token for accessing protected endpoints.
 *       
 *       **Process:**
 *       1. Validates email and password
 *       2. Checks if user exists and email is verified
 *       3. Compares password hash
 *       4. Generates JWT token (valid for 24 hours)
 *       5. Returns token and user information
 *       
 *       **Authentication:**
 *       - Only verified users can login
 *       - JWT token must be included in Authorization header for protected endpoints
 *       - Token format: `Bearer <jwt-token>`
 *       
 *       **Security Features:**
 *       - Password comparison is timing-safe
 *       - JWT tokens are signed and secure
 *       - Failed login attempts are logged
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           examples:
 *             validLogin:
 *               summary: Valid login credentials
 *               value:
 *                 email: "john.doe@example.com"
 *                 password: "SecurePassword123!"
 *             invalidCredentials:
 *               summary: Invalid credentials
 *               value:
 *                 email: "john.doe@example.com"
 *                 password: "wrongpassword"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *             examples:
 *               successfulLogin:
 *                 summary: Successful login response
 *                 value:
 *                   success: true
 *                   message: "Login successful"
 *                   token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1MDdmMWY3N2JjZjg2Y2Q3OTk0MzkwMTEiLCJpYXQiOjE2NzM4NzQ0MDAsImV4cCI6MTY3Mzk2MDgwMH0.example"
 *                   user:
 *                     _id: "507f1f77bcf86cd799439011"
 *                     name: "John Doe"
 *                     email: "john.doe@example.com"
 *                     isVerified: true
 *                     createdAt: "2024-01-15T10:30:00.000Z"
 *                     updatedAt: "2024-01-15T10:30:00.000Z"
 *       400:
 *         description: Bad request - validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - invalid credentials or unverified email
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               invalidCredentials:
 *                 summary: Invalid email or password
 *                 value:
 *                   success: false
 *                   message: "Invalid email or password"
 *                   status: 401
 *               unverifiedEmail:
 *                 summary: Email not verified
 *                 value:
 *                   success: false
 *                   message: "Please verify your email before logging in"
 *                   status: 401
 *       500:
 *         description: Internal server error
 */
router.post('/login', loginFailureLimiter, authCtrl.login);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current user information
 *     description: |
 *       Returns the current user's information based on the JWT token.
 *       
 *       **Authentication:**
 *       - Requires valid JWT token in Authorization header
 *       - Token format: `Bearer <jwt-token>`
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: User ID
 *                 username:
 *                   type: string
 *                   description: Username
 *                 email:
 *                   type: string
 *                   description: Email address
 *                 emailVerified:
 *                   type: boolean
 *                   description: Whether email is verified
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   description: Account creation date
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       404:
 *         description: User not found
 */
router.get('/me', auth, authCtrl.getMe);

// Additional routes with rate limiting
// router.post('/refresh-token', authLimiter, authCtrl.refreshToken);
// router.post('/forgot-password', authLimiter, authCtrl.forgotPassword);
// router.post('/reset-password', authLimiter, authCtrl.resetPassword);

module.exports = router;
