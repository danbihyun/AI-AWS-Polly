const { SchedulerClient, CreateScheduleCommand } = require("@aws-sdk/client-scheduler");

const scheduler = new SchedulerClient({ region: process.env.AWS_REGION });

exports.handler = async (event) => {
  // EventBridge S3 이벤트에서 key/bucket 위치가 다를 수 있으니 안전하게 여러 경로 커버
  const bucket =
    event?.detail?.bucket?.name ||
    event?.bucket;

  const key =
    event?.detail?.object?.key ||
    event?.detail?.object?.key?.[0] ||
    event?.key;

  if (!bucket || !key) return { error: "missing bucket/key", event };

  // prefix 제한
  const prefix = process.env.PREFIX || "polly-lab/";
  if (!key.startsWith(prefix)) return { skipped: true, reason: "not target prefix", key };

  const delayMs = Number(process.env.DELAY_MS || 600000); // default 10m
  const deleteAt = new Date(Date.now() + delayMs);
  const iso = deleteAt.toISOString().replace(/\.\d{3}Z$/, "Z"); // at()용

  const scheduleName = `del10m-${Date.now()}-${Math.random().toString(16).slice(2)}`;

  await scheduler.send(new CreateScheduleCommand({
    Name: scheduleName,
    GroupName: "default",
    ScheduleExpression: `at(${iso})`,
    FlexibleTimeWindow: { Mode: "OFF" },
    Target: {
      Arn: process.env.DELETE_LAMBDA_ARN,
      RoleArn: process.env.SCHEDULER_ROLE_ARN,
      Input: JSON.stringify({ bucket, key })
    }
  }));

  return { scheduled: true, scheduleName, deleteAt: iso, bucket, key };
};
