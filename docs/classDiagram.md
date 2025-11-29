# Class Diagrams (Mermaid)

Mermaid class diagrams for the current codebase. They include the main attributes, key operations, and relationships that already exist in the source.

## 1. Core Domain & Persistence (Backend)

```mermaid
classDiagram
    class UserEntity {
        +Long id
        +String username
        +String password
        +String fullName
        +String phoneNumber
        +String email
        +Boolean status
        +String bio
    }
    class RoleEntity {
        +Long id
        +String name
    }
    class UserRoleEntity {
        +Long id
    }
    class UserFollowEntity {
        +Long id
    }
    class TagEntity {
        +Long id
        +String name
    }
    class DocumentEntity {
        +Long id
        +String title
        +String content
        +LocalDate createdDate
        +LocalDate lastModified
        +Boolean isPublic
    }
    class DocumentLikeEntity {
        +Long id
    }
    class BookmarkEntity {
        +Long id
    }
    class DocumentCommentEntity {
        +Long id
        +String content
    }
    class ReportUserReasonEntity {
        +Long id
        +String reason
    }
    class ReportUserEntity {
        +Long id
    }
    class ReportDocumentReasonEntity {
        +Long id
        +String reason
    }
    class ReportDocumentEntity {
        +Long id
    }

    UserEntity "1" --> "*" DocumentEntity : author
    UserEntity "1" --> "*" DocumentLikeEntity : likes
    UserEntity "1" --> "*" BookmarkEntity : bookmarks
    UserEntity "1" --> "*" DocumentCommentEntity : comments
    UserEntity "1" --> "*" UserFollowEntity : follower
    UserFollowEntity "*" --> "1" UserEntity : followee
    UserEntity "1" --> "*" UserRoleEntity
    UserRoleEntity "*" --> "1" RoleEntity
    DocumentEntity "*" --> "1" TagEntity
    DocumentLikeEntity "*" --> "1" DocumentEntity
    BookmarkEntity "*" --> "1" DocumentEntity
    DocumentCommentEntity "*" --> "1" DocumentEntity
    ReportUserEntity "*" --> "1" UserEntity : reporter
    ReportUserEntity "*" --> "1" UserEntity : target
    ReportUserEntity "*" --> "1" ReportUserReasonEntity
    ReportDocumentEntity "*" --> "1" UserEntity : reporter
    ReportDocumentEntity "*" --> "1" DocumentCommentEntity : targetComment
    ReportDocumentEntity "*" --> "1" ReportDocumentReasonEntity
```

## 2. Authentication, Documents, Security, and API Layer (Backend)

```mermaid
classDiagram
    class AuthController {
        +register(request): RegisterResponse
        +login(request): LoginResponse
    }
    class DocumentController {
        +createDocument(request): CreateDocumentResponse
    }
    class UserController {
        +getCurrentUser(): ResponseEntity
        +updateCurrentUser(request): ResponseEntity
        +deleteCurrentUser(request): ResponseEntity
    }
    class AuthService {
        +register(request): RegisterResponse
        +login(request): LoginResponse
    }
    class DocumentService {
        +createDocument(request): CreateDocumentResponse
    }
    class JwtService {
        +generateToken(userDetails): String
        +generateRefreshToken(userDetails): String
        +extractUsername(token): String
        +validateToken(token, userDetails): boolean
    }
    class JwtAuthFilter {
        +doFilterInternal(req,res,chain)
    }
    class SecurityConfig {
        +securityFilterChain(http): SecurityFilterChain
        +authenticationProvider(): AuthenticationProvider
        +authenticationManager(config): AuthenticationManager
        +passwordEncoder(): PasswordEncoder
    }
    class UserDetailsServiceImpl {
        +loadUserByUsername(username): UserDetails
    }
    class GlobalExceptionHandler {
        +handleValidationExceptions(ex): ResponseEntity
        +handleUserExists(ex): ResponseEntity
    }
    class UserAlreadyExistsException
    class UserNotFoundException
    class TagNotFoundException
    class UserRepository {
        +findByUsername(username): Optional~UserEntity~
        +findUserByEmail(email): Optional~UserEntity~
    }
    class DocumentRepository {
        +findDocumentByUser(user): Optional~DocumentEntity~
        +save(document)
    }
    class TagRepository {
        +findByName(name): Optional~TagEntity~
        +save(tag)
    }
    class PasswordEncoder
    class AuthenticationManager
    class CreateDocumentRequest {
        +String title
        +String content
        +List~String~ tags
        +boolean isPublic
    }
    class CreateDocumentResponse {
        +Long id
        +String title
        +List~String~ tags
        +boolean isPublic
    }

    AuthController --> AuthService : delegates
    DocumentController --> DocumentService : delegates
    DocumentController ..> CreateDocumentRequest
    DocumentController ..> CreateDocumentResponse
    UserController ..> UserEntity : uses DTO mapping
    AuthService --> UserRepository : persists users
    AuthService --> PasswordEncoder : hashes password
    AuthService --> JwtService : issues tokens
    AuthService --> AuthenticationManager : authenticates
    DocumentService --> DocumentRepository : persists documents
    DocumentService --> TagRepository : fetches tag
    DocumentService --> UserRepository : finds author
    DocumentService ..> TagNotFoundException
    DocumentService ..> UserNotFoundException
    DocumentService ..> CreateDocumentResponse
    JwtAuthFilter --> JwtService : validates token
    JwtAuthFilter --> UserDetailsServiceImpl : load user
    SecurityConfig --> JwtAuthFilter : registers filter
    SecurityConfig --> UserDetailsServiceImpl
    UserDetailsServiceImpl --> UserRepository
    GlobalExceptionHandler --> UserAlreadyExistsException : handles
    TagRepository ..> TagEntity
```

## 3. Frontend State, Auth, API, and Notifications (React)

```mermaid
classDiagram
    class App {
        +AppRoutes()
    }
    class UIContext {
        +showSidebar: boolean
        +theme: string
        +isLoading: boolean
    }
    class UIProvider {
        +setShowSidebar()
        +setTheme()
        +setIsLoading()
    }
    class useUIContext {
        +(): UIContext
    }
    class useAuth {
        -BACKEND_URL: string
        +login(username, password)
        +register(username, password, confirmPassword, fullName, phone, email)
    }
    class AxiosInterceptor {
        +interceptors.response
    }
    class useApi {
        +get(url, config)
        +post(url, data, config)
        +put(url, data, config)
        +delete(url, config)
    }
    class ToastProvider {
        +success(message, duration)
        +error(message, duration)
        +info(message, duration)
    }
    class useToast {
        +success(message, duration)
        +error(message, duration)
        +info(message, duration)
    }
    class Toast {
        +message
        +type
        +duration
    }
    class LoginForm {
        +handleSubmit(e)
    }
    class RegisterForm {
        +handleSubmit(e)
    }

    App --> UIProvider : wraps routes
    UIProvider --> UIContext : provides state
    useUIContext --> UIContext : consumes
    AxiosInterceptor ..> useApi : shares axiosInstance
    useApi ..> AxiosInterceptor : uses axios instance
    ToastProvider --> Toast : renders
    useToast --> ToastProvider : consumes
    LoginForm --> useAuth : calls login
    RegisterForm --> useAuth : calls register
```
