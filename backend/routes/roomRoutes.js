// routes/roomRoutes.js
const express     = require('express');
const router      = express.Router();
const auth        = require('../middleware/auth');
const roomMember  = require('../middleware/roomMember');
const roomCtrl    = require('../controllers/roomController');

/**
 * @swagger
 * components:
 *   schemas:
 *     Room:
 *       type: object
 *       required:
 *         - name
 *         - description
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated MongoDB ObjectId of the room
 *           example: "507f1f77bcf86cd799439011"
 *         name:
 *           type: string
 *           description: The name of the room/workspace
 *           example: "Project Alpha Team"
 *         description:
 *           type: string
 *           description: Detailed description of the room's purpose
 *           example: "Development team for Project Alpha - Frontend and Backend collaboration"
 *         owner:
 *           type: string
 *           description: The MongoDB ObjectId of the room owner
 *           example: "507f1f77bcf86cd799439012"
 *         members:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               user:
 *                 type: string
 *                 description: User ID of the member
 *                 example: "507f1f77bcf86cd799439013"
 *               role:
 *                 type: string
 *                 enum: [owner, admin, member]
 *                 description: Member's role in the room
 *                 example: "member"
 *               status:
 *                 type: string
 *                 enum: [pending, approved, rejected]
 *                 description: Status of the member's join request
 *                 example: "approved"
 *               joinedAt:
 *                 type: string
 *                 format: date-time
 *                 description: When the member joined the room
 *                 example: "2024-01-15T10:30:00.000Z"
 *           description: Array of room members with their roles and status
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the room was created
 *           example: "2024-01-15T10:30:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: When the room was last updated
 *           example: "2024-01-15T10:30:00.000Z"
 *     CreateRoomRequest:
 *       type: object
 *       required:
 *         - name
 *         - description
 *       properties:
 *         name:
 *           type: string
 *           minLength: 3
 *           maxLength: 100
 *           description: Room name (3-100 characters)
 *           example: "Project Alpha Team"
 *         description:
 *           type: string
 *           maxLength: 500
 *           description: Room description (max 500 characters)
 *           example: "Development team for Project Alpha - Frontend and Backend collaboration"
 *     JoinRoomRequest:
 *       type: object
 *       required:
 *         - roomId
 *       properties:
 *         roomId:
 *           type: string
 *           description: The MongoDB ObjectId of the room to join
 *           example: "507f1f77bcf86cd799439011"
 *         message:
 *           type: string
 *           maxLength: 200
 *           description: Optional message to the room owner
 *           example: "I would like to join this room to contribute to the project"
 *     ApproveMemberRequest:
 *       type: object
 *       required:
 *         - userId
 *         - action
 *       properties:
 *         userId:
 *           type: string
 *           description: The MongoDB ObjectId of the user to approve/reject
 *           example: "507f1f77bcf86cd799439013"
 *         action:
 *           type: string
 *           enum: [approve, reject]
 *           description: Action to perform on the join request
 *           example: "approve"
 *         role:
 *           type: string
 *           enum: [member, admin]
 *           default: "member"
 *           description: "Role to assign if approving (default: member)"
 *           example: "member"
 */

/**
 * @swagger
 * tags:
 *   name: Rooms
 *   description: Collaborative workspace management - create rooms, manage members, and handle join requests
 */

/**
 * @swagger
 * /rooms:
 *   post:
 *     summary: Create a new collaborative room
 *     description: |
 *       Creates a new room/workspace for team collaboration. The creator automatically becomes the room owner.
 *       
 *       **Room Features:**
 *       - **Owner**: Has full control over the room and can manage members
 *       - **Members**: Can view and participate in room activities
 *       - **Join Requests**: Users can request to join rooms (requires owner approval)
 *       - **Tasks**: Rooms can contain multiple tasks for team collaboration
 *       
 *       **Permissions:**
 *       - Only authenticated users can create rooms
 *       - Room owner can approve/reject join requests
 *       - Room owner can assign admin roles to members
 *       
 *       **Next Steps:**
 *       - Share the room ID with team members
 *       - Members can request to join using `/rooms/join`
 *       - Owner can approve members using `/rooms/{id}/approve`
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateRoomRequest'
 *           examples:
 *             developmentTeam:
 *               summary: Development team room
 *               value:
 *                 name: "Project Alpha Team"
 *                 description: "Development team for Project Alpha - Frontend and Backend collaboration"
 *             marketingTeam:
 *               summary: Marketing team room
 *               value:
 *                 name: "Marketing Campaign 2024"
 *                 description: "Marketing team for Q1 2024 campaign planning and execution"
 *     responses:
 *       201:
 *         description: Room created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Room'
 *                 message:
 *                   type: string
 *                   example: "Room created successfully"
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
router.post('/', auth, roomCtrl.createRoom);

/**
 * @swagger
 * /rooms/my:
 *   get:
 *     summary: Get all rooms owned by the authenticated user
 *     description: |
 *       Retrieves all rooms where the authenticated user is the owner or a member.
 *       
 *       **Response includes:**
 *       - Rooms owned by the user
 *       - Rooms where user is a member
 *       - Member details and roles
 *       - Room creation and update timestamps
 *       
 *       **Use Cases:**
 *       - Display user's dashboard with all their rooms
 *       - Show room membership status
 *       - Allow users to navigate between their rooms
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's rooms retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Room'
 *                 message:
 *                   type: string
 *                   example: "Rooms retrieved successfully"
 *       401:
 *         description: Unauthorized - invalid token
 *       500:
 *         description: Internal server error
 */
router.get('/my', auth, roomCtrl.listMyRooms);

/**
 * @swagger
 * /rooms/join:
 *   post:
 *     summary: Request to join a room
 *     description: |
 *       Sends a join request to a room. The request will be pending until the room owner approves or rejects it.
 *       
 *       **Process:**
 *       1. Validates the room exists
 *       2. Checks if user is already a member
 *       3. Creates a pending join request
 *       4. Notifies the room owner (if real-time notifications are enabled)
 *       
 *       **Join Request States:**
 *       - **Pending**: Waiting for owner approval
 *       - **Approved**: User becomes a member
 *       - **Rejected**: Request denied by owner
 *       
 *       **Important Notes:**
 *       - Users cannot join rooms they're already members of
 *       - Room owner cannot send join requests to their own room
 *       - Join requests expire after 30 days if not acted upon
 *       
 *       **After Approval:**
 *       - User can access room tasks and activities
 *       - User can participate in room discussions
 *       - User can be assigned tasks within the room
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/JoinRoomRequest'
 *           examples:
 *             joinRequest:
 *               summary: Join room request
 *               value:
 *                 roomId: "507f1f77bcf86cd799439011"
 *                 message: "I would like to join this room to contribute to the project"
 *             joinRequestNoMessage:
 *               summary: Join request without message
 *               value:
 *                 roomId: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Join request submitted successfully
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
 *                   example: "Join request submitted successfully. Waiting for owner approval."
 *       400:
 *         description: Bad request - room not found or already a member
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               alreadyMember:
 *                 summary: User already a member
 *                 value:
 *                   success: false
 *                   message: "You are already a member of this room"
 *                   status: 400
 *               roomNotFound:
 *                 summary: Room not found
 *                 value:
 *                   success: false
 *                   message: "Room not found"
 *                   status: 400
 *       401:
 *         description: Unauthorized - invalid token
 *       500:
 *         description: Internal server error
 */
router.post('/join', auth, roomCtrl.requestJoin);

/**
 * @swagger
 * /rooms/{id}/approve:
 *   patch:
 *     summary: Approve or reject a member's join request (owner only)
 *     description: |
 *       Allows room owners to approve or reject pending join requests from users.
 *       
 *       **Owner Actions:**
 *       - **Approve**: User becomes a member with specified role
 *       - **Reject**: Join request is denied
 *       
 *       **Member Roles:**
 *       - **Member**: Can view and participate in room activities
 *       - **Admin**: Can manage tasks and moderate room activities
 *       - **Owner**: Full control (automatically assigned to room creator)
 *       
 *       **Process:**
 *       1. Validates the user has a pending request
 *       2. Updates the request status (approved/rejected)
 *       3. If approved, adds user to room members with specified role
 *       4. Notifies the user of the decision
 *       
 *       **Permissions:**
 *       - Only room owners can approve/reject requests
 *       - Owners cannot approve their own requests
 *       - Rejected users can submit new requests after 24 hours
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Room ID
 *         example: "507f1f77bcf86cd799439011"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ApproveMemberRequest'
 *           examples:
 *             approveMember:
 *               summary: Approve member request
 *               value:
 *                 userId: "507f1f77bcf86cd799439013"
 *                 action: "approve"
 *                 role: "member"
 *             approveAdmin:
 *               summary: Approve as admin
 *               value:
 *                 userId: "507f1f77bcf86cd799439013"
 *                 action: "approve"
 *                 role: "admin"
 *             rejectMember:
 *               summary: Reject member request
 *               value:
 *                 userId: "507f1f77bcf86cd799439013"
 *                 action: "reject"
 *     responses:
 *       200:
 *         description: Member request processed successfully
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
 *                   example: "Member approved successfully"
 *                 member:
 *                   $ref: '#/components/schemas/Room'
 *       400:
 *         description: Bad request - invalid action or user not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - invalid token
 *       403:
 *         description: Forbidden - not the room owner
 *       404:
 *         description: Room not found
 *       500:
 *         description: Internal server error
 */
router.patch('/:id/approve', auth, roomCtrl.approveMember);

/**
 * @swagger
 * /rooms/{id}:
 *   get:
 *     summary: Get room details (members only)
 *     description: |
 *       Retrieves detailed information about a specific room. Only room members can access this endpoint.
 *       
 *       **Response includes:**
 *       - Room basic information (name, description)
 *       - Complete member list with roles and status
 *       - Room creation and update timestamps
 *       - Owner information
 *       
 *       **Use Cases:**
 *       - Display room dashboard
 *       - Show member list and roles
 *       - Room management interface
 *       
 *       **Member Information:**
 *       - **User ID**: Member's unique identifier
 *       - **Role**: Member's role in the room (owner, admin, member)
 *       - **Status**: Current status (approved, pending, rejected)
 *       - **Joined At**: When the member joined the room
 *       
 *       **Permissions:**
 *       - Only room members can access room details
 *       - Non-members will receive 403 Forbidden
 *       - Room owners see additional management options
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Room ID
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Room details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Room'
 *                 message:
 *                   type: string
 *                   example: "Room details retrieved successfully"
 *       401:
 *         description: Unauthorized - invalid token
 *       403:
 *         description: Forbidden - not a member of the room
 *       404:
 *         description: Room not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', auth, roomMember, roomCtrl.getRoomDetails);

/**
 * @swagger
 * /rooms/members:
 *   get:
 *     summary: Get all users for task assignment
 *     description: |
 *       Retrieves a list of all users in the system for task assignment purposes.
 *       
 *       **Use Cases:**
 *       - Task assignment dropdown
 *       - User selection for room invitations
 *       - Team member lookup
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: User ID
 *                   username:
 *                     type: string
 *                     description: Username
 *                   email:
 *                     type: string
 *                     description: Email address
 *       401:
 *         description: Unauthorized - invalid token
 *       500:
 *         description: Internal server error
 */
router.get('/members', auth, roomCtrl.getMembers);

/**
 * @swagger
 * /rooms/{id}:
 *   delete:
 *     summary: Delete a room (owner only)
 *     description: |
 *       Deletes a room permanently. Only the room owner can perform this action.
 */
router.delete('/:id', auth, roomCtrl.deleteRoom);

module.exports = router;
