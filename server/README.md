## BuzzBoard API

Environment variables to create in a `.env` file:

- `PORT` (default `5000`)
- `MONGODB_URI` (e.g. `mongodb://127.0.0.1:27017/buzzboard`)
- `JWT_SECRET` (any random string)
- `CLIENT_URL` (e.g. `http://localhost:5173`)

Scripts:

- `npm run dev` to start with nodemon
- `npm start` to start with node

Healthcheck: `GET /health`


