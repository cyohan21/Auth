# Auth

Auth is an open-source authentication application designed for reuse. It contains a Next.js client and a Node/Express server that relies on Prisma and JSON Web Tokens (JWT). The frontend interface is now feature complete, providing pages for registration, login and password recovery.

## Features

* **Email verification** – users confirm their account via an emailed link.
* **Login & logout** – JWT access and refresh tokens are issued and managed with cookies.
* **Password resets** – reset links are sent via email with checks for password reuse.
* **Rate limiting** – prevents brute-force attempts on sensitive endpoints.
* **Complete Next.js frontend** – includes pages for sign up, login and account recovery.

The server exposes all authentication endpoints under `/api/auth`.

## Getting Started

### Server

```bash
cd server
npm install
npm run dev
```

### Client

```bash
cd client
npm install
npm run dev
```

The finished UI covers registration, login and password management. Use `npm run build` to generate a production build.

The server expects a PostgreSQL database configured via the `DATABASE_URL` environment variable and uses other environment variables for email settings and JWT secrets.

### Environment variables

Create a `.env` file inside `server` with the following values:

```text
DATABASE_URL=postgres://user:password@localhost:5432/auth
JWT_SECRET=yourSecret
EMAIL_HOST=smtp.example.com
AUTH_USER=postmaster@example.com
AUTH_PASS=yourEmailPassword
PORT=3030
# optional for integration tests
TEST_RECIPIENT=user@example.com
```

Run `npx prisma migrate deploy` (or `prisma migrate dev` for development) to set up the database schema.

### Running tests

```bash
cd server
npm test
```

## License

This project is provided under the ISC license and welcomes contributions from the community.

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.
