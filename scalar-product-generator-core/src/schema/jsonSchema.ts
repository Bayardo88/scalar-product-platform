import { zodResponseFormat } from "openai/helpers/zod";
import { SaaSBriefSchema } from "./saasBrief.schema";

const formatted = zodResponseFormat(SaaSBriefSchema, "SaaSAppBrief");

export const SaaSBriefJSONSchema = formatted.json_schema.schema;
