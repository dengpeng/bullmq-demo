import { MetricsTime, Queue, Worker } from "bullmq";

const connection = {
  host: "localhost",
  port: 6379,
};

// ----------------------------

const queue = new Queue("foo", {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
  },
});

queue.on("error", (err) => {
  console.log("*** Queue error", err);
});

// ----------------------------

const worker = new Worker(
  "foo",
  async (job) => {
    console.log(job.data);
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate some work
    if (Math.random() < 0.1) {
      throw new Error("Random error"); // Simulate random error with a 10% chance
    }
  },
  {
    connection,
    metrics: {
      maxDataPoints: MetricsTime.ONE_WEEK * 2,
    },
  }
);

worker.on("active", (job) => {
  console.log("▼ Worker active", job.id);
});
worker.on("completed", (job) => {
  console.log("▲ Worker completed", job.id, "\n");
});
worker.on("failed", (job, err) => {
  console.error(err);
  console.log("▲ ⚠️ Worker failed", job?.id, "\n");
});
worker.on("error", (err) => {
  console.error(err);
  console.log("▲ 🔴 Worker error\n");
});

// ----------------------------

export const addJob = async (data: any) => {
  await queue.add("myJob", data);
};

export const getMetrics = async () => {
  return {
    completed: await queue.getMetrics("completed"),
    failed: await queue.getMetrics("failed"),
    active: await queue.getActiveCount(),
    waiting: await queue.getWaitingCount(),
    workers: await queue.getWorkersCount(),
    jobs: await queue.getJobCounts(),
  };
};

console.log("Queue initialized: ", queue.name);
console.log("Worker ready", worker.name);
