import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiCookieAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { RegistrateDto } from '../DTO/requests/registrate.dto';
import { EmailDto } from '../DTO/requests/email.dto';
import { LoginDto } from '../DTO/requests/login.dto';

const success = (data: unknown) => ({
  success: true,
  data,
  timestamp: '2026-03-16T10:00:00.000Z',
  path: '/api/example',
  method: 'POST',
});

const error = (
  statusCode: number,
  code: string,
  message: string,
  details?: unknown,
) => ({
  success: false,
  error: {
    statusCode,
    error:
      {
        400: 'Bad Request',
        401: 'Unauthorized',
        403: 'Forbidden',
        404: 'Not Found',
        409: 'Conflict',
      }[statusCode] ?? 'Error',
    code,
    message,
    ...(details !== undefined ? { details } : {}),
  },
  timestamp: '2026-03-16T10:00:00.000Z',
  path: '/api/example',
  method: 'POST',
});

const commonErrors = [
  ApiBadRequestResponse({
    schema: {
      example: error(400, 'BAD_REQUEST', 'Validation failed', [
        {
          field: 'email',
          constraints: {
            isEmail: 'email must be an email',
          },
        },
      ]),
    },
  }),
  ApiUnauthorizedResponse({
    schema: {
      example: error(401, 'UNAUTHORIZED', 'Wrong password'),
    },
  }),
  ApiForbiddenResponse({
    schema: {
      example: error(403, 'FORBIDDEN', 'Invalid refresh token'),
    },
  }),
  ApiNotFoundResponse({
    schema: {
      example: error(404, 'NOT_FOUND', 'User not found'),
    },
  }),
  ApiConflictResponse({
    schema: {
      example: error(409, 'CONFLICT', 'Email already in use'),
    },
  }),
];

export class AuthSwagger {
  //REGISTRATION
  // 1. Register new user
  static Registrate = [
    ApiOperation({ summary: 'Register new user' }),
    ApiBody({
      type: RegistrateDto,
      examples: {
        example: {
          summary: 'Example request',
          value: {
            email: 'example@mail.com',
            password: '123paS$word',
            userName: 'userName',
          },
        },
      },
    }),
    ApiOkResponse({
      schema: {
        example: success({
          email: 'example@mail.com',
          expiresTime: '2025-11-18T12:45:30.032Z',
          message: 'User created. Check your email for verification code.',
        }),
      },
    }),
    ...commonErrors,
  ];
  static GetNewCode = [
    ApiOperation({ summary: 'Request new verification code' }),
    ApiBody({
      type: EmailDto,
      examples: {
        example: {
          value: {
            email: 'example@mail.com',
          },
        },
      },
    }),
    ApiOkResponse({
      schema: {
        example: success({
          email: 'example@mail.com',
          expiresTime: '2025-11-18T12:59:49.521Z',
          message: 'Check your email for verification code.',
        }),
      },
    }),
    ...commonErrors,
  ];

  // 3. Verify email
  static VerifyEmail = [
    ApiOperation({ summary: 'Verify email with code' }),
    ApiBody({
      schema: {
        example: {
          email: 'example@mail.com',
          confirmCode: '123456',
        },
      },
    }),
    ApiOkResponse({
      schema: {
        example: success({
          user: {
            userId: 6,
            email: 'example@mail.com',
            role: 'USER',
          },
          accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        }),
      },
    }),
    ...commonErrors,
  ];
  //AUTH
  //1. Login
  static Login = [
    ApiOperation({ summary: 'Login user' }),
    ApiBody({
      type: LoginDto,
      examples: {
        example: {
          value: {
            email: 'example@mail.com',
            password: '123paS$word',
          },
        },
      },
    }),
    ApiOkResponse({
      schema: {
        example: success({
          message: 'Login successful',
          user: {
            id: 7,
            email: 'example@mail.com',
            role: 'ADMIN',
          },
          accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVC',
        }),
      },
    }),
    ...commonErrors,
  ];
  //2.Refresh tokens
  static RefreshTokens = [
    ApiOperation({ summary: 'Refresh tokens' }),
    ApiCookieAuth('refresh_token'),
    ApiOkResponse({
      schema: {
        example: success({
          message: 'Tokens refreshed',
          accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI...',
        }),
      },
    }),
    ...commonErrors,
  ];
  //3. Logout
  static Logout = [
    ApiOperation({ summary: 'Logout user' }),
    ApiBearerAuth('access_token'),
    ApiCookieAuth('refresh_token'),
    ApiOkResponse({
      schema: {
        example: success({ message: 'User logged out' }),
      },
    }),
    ...commonErrors,
  ];
  //PASSWORD
  //1. Change password
  static ChangePass = [
    ApiOperation({ summary: 'Change user password' }),
    ApiBearerAuth('access_token'),
    ApiBody({
      schema: {
        example: {
          oldPassword: '123paS$word',
          newPassword: '123paS$word1',
        },
      },
    }),
    ApiOkResponse({
      schema: {
        example: success({ message: 'Password successfully changed.' }),
      },
    }),
    ...commonErrors,
  ];
  //2.Forgot password
  static ForgotPass = [
    ApiOperation({ summary: 'Get temporary password' }),
    ApiBody({
      schema: {
        example: {
          email: 'example@mail.com',
        },
      },
    }),
    ApiOkResponse({
      schema: {
        example: success({
          message: 'Password successfully changed. Check your email',
        }),
      },
    }),
    ...commonErrors,
  ];
  //SESSIONS
  //1. Get users sessions
  static GetUserSessions = [
    ApiOperation({ summary: 'Get user sessions' }),
    ApiBearerAuth('access_token'),
    ApiCookieAuth('refresh_token'),
    ApiOkResponse({
      schema: {
        example: success({
          data: [
            {
              userId: '6',
              deviceId: 'uuid',
              session: {
                userAgent: 'Internet Explorer',
                device: 'Iphone 4g',
                location: {
                  ip: '14.88.420.13',
                  city: 'Titsburg',
                  country: 'Alboobia',
                },
              },
            },
          ],
        }),
      },
    }),
    ...commonErrors,
  ];
  //2. Delete session
  static DeleteSession = [
    ApiOperation({ summary: 'Delete user session' }),
    ApiBearerAuth('access_token'),
    ApiCookieAuth('refresh_token'),
    ApiQuery({
      name: 'deviceId',
      example: '375af541-ac19-437e-82e8-68432c2a3340',
    }),
    ApiOkResponse({
      schema: {
        example: success({
          message: 'Session 375af541-ac19-437e-82e8-68432c2a3340 is closed',
        }),
      },
    }),
    ...commonErrors,
  ];
  //ADMIN
  //1.Get all sessions
  static AdminAllSessions = [
    ApiOperation({
      summary: 'Get all active sessions (ADMIN)',
    }),
    ApiBearerAuth('access_token'),
    ApiOkResponse({
      schema: {
        example: success({
          data: [
            {
              userId: '6',
              deviceId: 'uuid',
              session: {
                userAgent: 'Internet Explorer',
                device: 'Iphone 4g',
                location: {
                  ip: '14.88.420.13',
                  city: 'Titsburg',
                  country: 'Alboobia',
                },
              },
            },
          ],
        }),
      },
    }),
    ...commonErrors,
  ];
  //2. Logout user sessions
  static AdminLogoutUserSessions = [
    ApiOperation({
      summary: 'Logout all sessions of specific user (ADMIN)',
    }),
    ApiBearerAuth('access_token'),
    ApiParam({ name: 'userId', example: 8 }),
    ApiOkResponse({
      schema: {
        example: success({
          message: 'Session of 8 is closed',
        }),
      },
    }),
    ...commonErrors,
  ];

  //3. Revoke all sessions
  static AdminLogoutAllSessions = [
    ApiOperation({
      summary: 'Logout ALL sessions (ADMIN)',
    }),
    ApiBearerAuth('access_token'),
    ApiOkResponse({
      schema: {
        example: success({ message: 'All sessions is closed' }),
      },
    }),
    ...commonErrors,
  ];
}
