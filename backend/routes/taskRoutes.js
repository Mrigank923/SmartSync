// routes/taskRoutes.js
const express      = require('express');
const router       = express.Router();
const auth         = require('../middleware/auth');        // JWT → req.user
const roomMember   = require('../middleware/roomMember');  // ensures user ∈ room.members
const taskCtrl     = require('../controllers/taskController');

/**
 * @swagger
 * components:
 *   schemas:
 *     Task:
 *       type: object
 *       required:
 *         - title
 *         - description
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the task
 *         title:
 *           type: string
 *           description: The title of the task
 *         description:
 *           type: string
 *           description: The description of the task
 *         status:
 *           type: string
 *           enum: [todo, in-progress, completed]
 *           default: todo
 *           description: The current status of the task
 *         priority:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *           default: medium
 *           description: The priority level of the task
 *         assignedTo:
 *           type: string
 *           description: The ID of the user assigned to the task
 *         createdBy:
 *           type: string
 *           description: The ID of the user who created the task
 *         roomId:
 *           type: string
 *           description: The ID of the room this task belongs to (null for personal tasks)
 *         dueDate:
 *           type: string
 *           format: date-time
 *           description: The due date for the task
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of tags for the task
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     CreateTaskRequest:
 *       type: object
 *       required:
 *         - title
 *         - description
 *       properties:
 *         title:
 *           type: string
 *           example: "Implement user authentication"
 *         description:
 *           type: string
 *           example: "Add JWT-based authentication to the API"
 *         status:
 *           type: string
 *           enum: [todo, in-progress, completed]
 *           example: "todo"
 *         priority:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *           example: "high"
 *         assignedTo:
 *           type: string
 *           example: "507f1f77bcf86cd799439011"
 *         dueDate:
 *           type: string
 *           format: date-time
 *           example: "2024-12-31T23:59:59.000Z"
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           example: ["backend", "auth", "security"]
 *     UpdateTaskRequest:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         status:
 *           type: string
 *           enum: [todo, in-progress, completed]
 *         priority:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *         assignedTo:
 *           type: string
 *         dueDate:
 *           type: string
 *           format: date-time
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *     TaskResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           oneOf:
 *             - $ref: '#/components/schemas/Task'
 *             - type: array
 *               items:
 *                 $ref: '#/components/schemas/Task'
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
 *   name: Tasks
 *   description: Task management API
 */

/**
 * @swagger
 * /tasks:
 *   get:
 *     summary: Get personal tasks (not assigned to any room)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [todo, in-progress, completed]
 *         description: Filter tasks by status
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *         description: Filter tasks by priority
 *     responses:
 *       200:
 *         description: Personal tasks retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TaskResponse'
 *       401:
 *         description: Unauthorized - invalid token
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Create a new personal task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTaskRequest'
 *     responses:
 *       201:
 *         description: Task created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TaskResponse'
 *       400:
 *         description: Bad request - validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - invalid token
 *       500:
 *         description: Internal server error
 */
router
  .route('/')
  .get(auth, taskCtrl.getTasks)         // list personal
  .post(auth, taskCtrl.createTask);     // create personal

/**
 * @swagger
 * /tasks/rooms/{roomId}:
 *   get:
 *     summary: Get tasks in a specific room
 *     tags: [Tasks]
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [todo, in-progress, completed]
 *         description: Filter tasks by status
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *         description: Filter tasks by priority
 *     responses:
 *       200:
 *         description: Room tasks retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TaskResponse'
 *       401:
 *         description: Unauthorized - invalid token
 *       403:
 *         description: Forbidden - not a member of the room
 *       404:
 *         description: Room not found
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Create a new task in a specific room
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *         description: Room ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTaskRequest'
 *     responses:
 *       201:
 *         description: Task created successfully in room
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TaskResponse'
 *       400:
 *         description: Bad request - validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - invalid token
 *       403:
 *         description: Forbidden - not a member of the room
 *       404:
 *         description: Room not found
 *       500:
 *         description: Internal server error
 */
router
  .route('/rooms/:roomId')
  .get(auth, roomMember, taskCtrl.getTasks)      // list tasks in room
  .post(auth, roomMember, taskCtrl.createTask);  // create task in room

/**
 * @swagger
 * /tasks/{id}:
 *   put:
 *     summary: Update a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateTaskRequest'
 *     responses:
 *       200:
 *         description: Task updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TaskResponse'
 *       400:
 *         description: Bad request - validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - invalid token
 *       403:
 *         description: Forbidden - not authorized to update this task
 *       404:
 *         description: Task not found
 *       500:
 *         description: Internal server error
 *   delete:
 *     summary: Delete a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
 *     responses:
 *       200:
 *         description: Task deleted successfully
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
 *                   example: "Task deleted successfully"
 *       401:
 *         description: Unauthorized - invalid token
 *       403:
 *         description: Forbidden - not authorized to delete this task
 *       404:
 *         description: Task not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id',          auth, taskCtrl.updateTask);
router.delete('/:id',       auth, taskCtrl.deleteTask);

/**
 * @swagger
 * /tasks/{id}/smart-assign:
 *   post:
 *     summary: Smart assign a task to the best available team member
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
 *     responses:
 *       200:
 *         description: Task smart assigned successfully
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
 *                   example: "Task assigned to John Doe"
 *                 assignedTo:
 *                   type: string
 *                   description: ID of the assigned user
 *       400:
 *         description: Bad request - no suitable team member found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - invalid token
 *       403:
 *         description: Forbidden - not authorized to assign this task
 *       404:
 *         description: Task not found
 *       500:
 *         description: Internal server error
 */
router.post('/:id/smart-assign', auth, taskCtrl.smartAssign);

module.exports = router;
