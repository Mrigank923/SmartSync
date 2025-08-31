const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SmartSync API',
      version: '1.0.0',
      description: 
        '## SmartSync - Collaborative Task Management API\n\n' +
        'SmartSync is a comprehensive task management platform that enables teams to collaborate effectively on projects. This API provides all the functionality needed to manage tasks, rooms, and team collaboration.\n\n' +
        '### Key Features:\n' +
        '- **User Authentication**: Secure JWT-based authentication with email verification\n' +
        '- **Room Management**: Create and manage collaborative workspaces\n' +
        '- **Task Management**: Create, assign, and track tasks with smart assignment\n' +
        '- **Activity Logging**: Complete audit trail of all activities\n' +
        '- **Real-time Updates**: Socket.IO integration for live updates\n\n' +
        '### Getting Started:\n' +
        '1. Register a new account using the `/auth/register` endpoint\n' +
        '2. Verify your email with the OTP sent to your inbox\n' +
        '3. Login to get your JWT token\n' +
        '4. Use the token in the Authorization header for all protected endpoints\n\n' +
        '### Authentication:\n' +
        'All protected endpoints require a JWT token in the Authorization header:\n' +
        '```\n' +
        'Authorization: Bearer <your-jwt-token>\n' +
        '```\n\n' +
        '### Rate Limiting:\n' +
        '- 100 requests per minute per IP address\n' +
        '- 1000 requests per hour per user\n\n' +
        '### Support:\n' +
        'For API support, contact: support@smartsync.com',
      contact: {
        name: 'SmartSync Team',
        email: 'support@smartsync.com',
        url: 'https://smartsync.com'
      },
      termsOfService: 'https://smartsync.com/terms'
    },
    servers: [
      {
        url: 'http://localhost:5001/api',
        description: 'Development server - Use this for testing and development'
      },
      {
        url: 'https://api.smartsync.com/api',
        description: 'Production server - Use this for live applications'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token obtained from login endpoint. Include in Authorization header as: Bearer <token>'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              description: 'Human-readable error message'
            },
            status: {
              type: 'number',
              description: 'HTTP status code'
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: {
                    type: 'string',
                    description: 'Field name that caused the error'
                  },
                  message: {
                    type: 'string',
                    description: 'Specific error message for this field'
                  }
                }
              },
              description: 'Array of field-specific validation errors'
            }
          }
        }
      },
      responses: {
        UnauthorizedError: {
          description: 'Access token is missing or invalid',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                message: 'Access token is missing or invalid',
                status: 401
              }
            }
          }
        },
        ValidationError: {
          description: 'Validation failed',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                message: 'Validation failed',
                status: 400,
                errors: [
                  {
                    field: 'email',
                    message: 'Invalid email format'
                  }
                ]
              }
            }
          }
        },
        ServerError: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                message: 'Internal server error',
                status: 500
              }
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'User registration, login, and email verification endpoints'
      },
      {
        name: 'Rooms',
        description: 'Collaborative workspace management - create rooms, manage members, and handle join requests'
      },
      {
        name: 'Tasks',
        description: 'Task management - create, update, delete, and smart-assign tasks to team members'
      },
      {
        name: 'Logs',
        description: 'Activity logging and audit trail - track all user actions and system events'
      }
    ],
    externalDocs: {
      description: 'Find more info about SmartSync',
      url: 'https://docs.smartsync.com'
    }
  },
  apis: ['./routes/*.js', './models/*.js'] // Path to the API docs
};

const specs = swaggerJsdoc(options);

module.exports = specs; 