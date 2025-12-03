"use server"

import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL as string,
  token: process.env.UPSTASH_REDIS_REST_TOKEN as string,
});


const toggleNotificationSettng = async () => {
  try {
    await redis.set("notification_sent", "false"); 
  } catch(e: any) {
    throw new Error(e.message);
  }
}

export default toggleNotificationSettng;
