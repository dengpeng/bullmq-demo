import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { addJob, getMetrics } from "./queue";
import { HTTPException } from "hono/http-exception";

const app = new Hono();

app.get("/", async (c) => {
  return c.json(await getMetrics());
});

app.post("/", async (c) => {
  try {
    const data = await c.req.json();
    await addJob(data);
  } catch (e) {
    throw new HTTPException(400);
  }
  return c.json({ message: "Job added to queue" });
});

app.post("/batch", async (c) => {
  const data = await c.req.json();
  const idBase = Date.now();
  for (let i = 0; i < 50; i++) {
    await addJob({ ...data, batchId: `${idBase}-${i + 1}` });
  }
  return c.json({ message: "Batch job added to queue" });
});

const port = parseInt(process.env.PORT ?? "3000");
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
