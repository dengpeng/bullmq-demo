## Simple BullMQ Demo

### Start

- Start a server instance using `pnpm dev`
- Default port is `3000`, can be changed using `PORT` env variable, like `PORT=4000 pnpm dev`
- You can start multiple instances of the app to simulate a distributed system

### API

- `GET /` returns queue metrics
- `POST /` add a single job, supporting any json payload in the body
- `POST /batch` add a batch of 50 jobs, supporting any json payload in the body

### Queue & Jobs

- Job simulates a 1s processing time
- Job has 10% chance of failing
- The queue is configured to retry 3 times for failed jobs

### Dependencies

- Hono
- Bullmq
