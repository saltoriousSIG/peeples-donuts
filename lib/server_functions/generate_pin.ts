"use server";
import axios from "axios";

const PIN_GENERATOR_ACCESS_TOKEN = process.env.PIN_GENERATOR_ACCESS_TOKEN;

const generate_pin = async (fid: number) => {
  try {
    const { data } = await axios.get("https://peeples-pins-generator.fly.dev/generate_pfp/" + fid, {
      headers: {
        Authorization: `Bearer ${PIN_GENERATOR_ACCESS_TOKEN}`,
      }
    });
    return {
      imageUrl: data.imageUrl,
      pinataUrl: data.pinataUrl,
      cid: data.pinataCid
    };
  } catch (e) {
    console.log(e)
    throw new Error("Failed to generate PIN");
  }
};

export default generate_pin;
