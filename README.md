# Express Workshop

An Express.js REST API server with MongoDB authentication, JWT token handling, and Docker setup.

## Environment Variables

Copy [.env.example](file:///Users/gu/Workspace/express-workshop/.env.example) to `.env` and configure your environment variables:

```bash
cp .env.example .env
```

### Example `.env` Configuration

```env
NODE_ENV=development
MONGO_URI=mongodb://admin:password@localhost:27017/?authSource=admin
JWT_SECRET=your_jwt_secret_key_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here
ADMIN_USERNAME=admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin12345
ADMIN_FULL_NAME=System Administrator
```

| Variable | Description |
| --- | --- |
| `NODE_ENV` | Application running environment (`development`, `production`, `test`) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key used for signing access tokens |
| `JWT_REFRESH_SECRET` | Secret key used for signing refresh tokens |
| `ADMIN_USERNAME` | (Optional) Username for initial admin seed (Default: `admin`) |
| `ADMIN_EMAIL` | (Optional) Email for initial admin seed (Default: `admin@example.com`) |
| `ADMIN_PASSWORD` | (Optional) Password for initial admin seed (Default: `admin12345`) |
| `ADMIN_FULL_NAME` | (Optional) Full name for initial admin seed (Default: `System Administrator`) |

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start MongoDB service (or use Docker Compose):
   ```bash
   docker-compose up -d
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```
