// routes/logRoutes.js
const express    = require('express');
const router     = express.Router();
const auth       = require('../middleware/auth');        // JWT → req.user
const roomMember = require('../middleware/roomMember');  // ensures user ∈ room
const logCtrl    = require('../controllers/logController');

/**
 * @swagger
 * components:
 *   schemas:
 *     Log:
 *       type: object
 *       required:
 *         - action
 *         - entityType
 *         - entityId
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the log entry
 *         action:
 *           type: string
 *           enum: [create, update, delete, assign, complete, join, leave]
 *           description: The action performed
 *         entityType:
 *           type: string
 *           enum: [task, room, user]
 *           description: The type of entity that was affected
 *         entityId:
 *           type: string
 *           description: The ID of the entity that was affected
 *         userId:
 *           type: string
 *           description: The ID of the user who performed the action
 *         roomId:
 *           type: string
 *           description: The ID of the room where the action occurred (null for personal actions)
 *         details:
 *           type: object
 *           description: Additional details about the action
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the log entry was created
 *     LogResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Log'
 *         pagination:
 *           type: object
 *           properties:
 *             page:
 *               type: number
 *               example: 1
 *             limit:
 *               type: number
 *               example: 10
 *             total:
 *               type: number
 *               example: 25
 *             pages:
 *               type: number
 *               example: 3
 *     Error:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Error message
 *         status:
 *           type: number
 *           description: HTTP status code
 */

/**
 * @swagger
 * tags:
 *   name: Logs
 *   description: Activity logs and audit trail API
 */

/**
 * @swagger
 * /logs:
 *   get:
 *     summary: Get personal activity logs (not related to any room)
 *     tags: [Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of logs per page
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *           enum: [create, update, delete, assign, complete, join, leave]
 *         description: Filter logs by action type
 *       - in: query
 *         name: entityType
 *         schema:
 *           type: string
 *           enum: [task, room, user]
 *         description: Filter logs by entity type
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *           example: "2024-01-01"
 *         description: Filter logs from this date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *           example: "2024-12-31"
 *         description: Filter logs until this date
 *     responses:
 *       200:
 *         description: Personal logs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LogResponse'
 *       401:
 *         description: Unauthorized - invalid token
 *       500:
 *         description: Internal server error
 */
router.get('/', auth, logCtrl.getLogs);

/**
 * @swagger
 * /logs/rooms/{roomId}:
 *   get:
 *     summary: Get activity logs for a specific room
 *     tags: [Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *         description: Room ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of logs per page
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *           enum: [create, update, delete, assign, complete, join, leave]
 *         description: Filter logs by action type
 *       - in: query
 *         name: entityType
 *         schema:
 *           type: string
 *           enum: [task, room, user]
 *         description: Filter logs by entity type
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *           example: "2024-01-01"
 *         description: Filter logs from this date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *           example: "2024-12-31"
 *         description: Filter logs until this date
 *     responses:
 *       200:
 *         description: Room logs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LogResponse'
 *       401:
 *         description: Unauthorized - invalid token
 *       403:
 *         description: Forbidden - not a member of the room
 *       404:
 *         description: Room not found
 *       500:
 *         description: Internal server error
 */
router.get('/rooms/:roomId', auth, roomMember, logCtrl.getLogs);

module.exports = router;
