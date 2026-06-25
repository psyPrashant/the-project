# authentication Specification

## Purpose
TBD - created by archiving change add-authentication-current-employee. Update Purpose after archive.
## Requirements
### Requirement: Login issues a JWT and resolves the current Employee
The system SHALL expose `POST /api/auth/login` accepting a validated `LoginRequest` (email, password). On valid credentials the system SHALL authenticate the caller, issue a stateless JWT (subject = employeeId, `email` claim, configurable expiry), and return an `AuthResponse` containing the token and the resolved current Employee's identity. The system SHALL create no server-side session.

#### Scenario: Valid credentials
- **WHEN** a client POSTs `/api/auth/login` with the email and password of a seeded Employee
- **THEN** the system responds 200 with a body containing a non-empty JWT `token`, `employeeId`, `email`, `firstName`, and `lastName`, and no server-side session is created

#### Scenario: Invalid password
- **WHEN** a client POSTs `/api/auth/login` with a known email but a wrong password
- **THEN** the system responds 401 with an `ErrorResponse` and does NOT return a token and does NOT create a session

#### Scenario: Unknown email
- **WHEN** a client POSTs `/api/auth/login` with an email that no Employee has
- **THEN** the system responds 401 with an `ErrorResponse` and does NOT create a session

#### Scenario: Missing required field
- **WHEN** a client POSTs `/api/auth/login` with a blank email or blank password
- **THEN** the system responds 400 with a validation `ErrorResponse` and does NOT create a session

### Requirement: Current Employee is resolvable from a valid token
The system SHALL resolve the authenticated caller to an Employee on every protected request. A `JwtAuthenticationFilter` SHALL extract the Bearer JWT, validate it, and load the Employee via the `EmployeeService` interface (never the repository). The resolved Employee SHALL be available to controllers through an `@CurrentEmployee` parameter resolved by a `HandlerMethodArgumentResolver`.

#### Scenario: Authenticated request returns current Employee
- **WHEN** a client GETs `/api/auth/me` with a valid Bearer token
- **THEN** the system responds 200 with the resolved current Employee's `EmployeeResponse` (id, email, firstName, lastName)

#### Scenario: Expired token
- **WHEN** a client GETs `/api/auth/me` with a JWT whose expiry is in the past
- **THEN** the system responds 401 and does NOT resolve an Employee

#### Scenario: Tampered or malformed token
- **WHEN** a client GETs `/api/auth/me` with a token that is not a valid/signed JWT
- **THEN** the system responds 401 and does NOT resolve an Employee

### Requirement: Unauthenticated requests to protected endpoints are refused
The system SHALL require authentication for every endpoint except `/api/auth/login` and `/actuator/health`. Unauthenticated requests to protected endpoints SHALL be refused with 401.

#### Scenario: Protected endpoint without token
- **WHEN** a client GETs `/api/auth/me` with no `Authorization` header
- **THEN** the system responds 401

#### Scenario: Public endpoints remain accessible without a token
- **WHEN** a client GETs `/actuator/health` with no `Authorization` header
- **THEN** the system responds 200

#### Scenario: Login endpoint accessible without a token
- **WHEN** a client POSTs `/api/auth/login` with no `Authorization` header
- **THEN** the system proceeds to authenticate the submitted credentials (not rejected as unauthenticated)

### Requirement: Security configuration and password storage
The system SHALL configure Spring Security as stateless: CSRF disabled, `SessionCreationPolicy.STATELESS`, CORS allowing the Angular origin (`http://localhost:4200`) including OPTIONS preflight, the `JwtAuthenticationFilter` registered before `UsernamePasswordAuthenticationFilter`, and a `BCryptPasswordEncoder` bean. Passwords SHALL be stored only as BCrypt hashes; plaintext passwords SHALL never be logged.

#### Scenario: CORS preflight succeeds
- **WHEN** the Angular app sends an OPTIONS preflight from `http://localhost:4200` to a protected endpoint
- **THEN** the system returns the appropriate CORS headers and does not reject on authentication grounds

#### Scenario: Password hashing uses BCrypt
- **WHEN** the system authenticates a login request
- **THEN** it compares the submitted password against the stored BCrypt `passwordHash` using the `PasswordEncoder` bean

### Requirement: Consistent error contract
The system SHALL return errors through a `@RestControllerAdvice` producing an `ErrorResponse` record `{status, message, timestamp}`. Bad credentials and invalid/expired tokens SHALL map to 401; validation failures to 400; access-denied to 403; entity-not-found to 404; unexpected errors to 500.

#### Scenario: Validation error shape
- **WHEN** a request fails Bean Validation
- **THEN** the system responds 400 with an `ErrorResponse` whose `status`, `message`, and `timestamp` fields are present

#### Scenario: Unexpected error shape
- **WHEN** an unexpected exception escapes a controller
- **THEN** the system responds 500 with an `ErrorResponse` and does not leak stack traces in the body

