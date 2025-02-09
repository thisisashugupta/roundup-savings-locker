import Capsule, { Environment } from "@usecapsule/react-sdk";

const env = Environment.BETA;
const apiKey = process.env.NEXT_PUBLIC_CAPSULE_API_KEY;

const capsuleClient = new Capsule(env, apiKey);

export default capsuleClient;
