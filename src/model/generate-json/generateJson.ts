import { FunctionOptions } from "../FunctionOptions.js";
import { executeCall } from "../executeCall.js";
import {
  JsonGenerationModel,
  JsonGenerationModelSettings,
  JsonGenerationPrompt,
} from "./JsonGenerationModel.js";

export function generateJson<
  T,
  PROMPT,
  RESPONSE,
  SETTINGS extends JsonGenerationModelSettings
>(
  model: JsonGenerationModel<PROMPT, RESPONSE, SETTINGS>,
  prompt: PROMPT & JsonGenerationPrompt<RESPONSE, T>,
  options?: FunctionOptions<SETTINGS>
): Promise<T> {
  return executeCall({
    model,
    options,
    callModel: (model, options) => generateJson(model, prompt, options),
    generateResponse: (options) => model.generateJsonResponse(prompt, options),
    extractOutputValue: (response): T => prompt.extractJson(response),
    getStartEvent: (metadata, settings) => ({
      type: "json-generation-started",
      metadata,
      settings,
      prompt,
    }),
    getAbortEvent: (metadata, settings) => ({
      type: "json-generation-finished",
      status: "abort",
      metadata,
      settings,
      prompt,
    }),
    getFailureEvent: (metadata, settings, error) => ({
      type: "json-generation-finished",
      status: "failure",
      metadata,
      settings,
      prompt,
      error,
    }),
    getSuccessEvent: (metadata, settings, response, output) => ({
      type: "json-generation-finished",
      status: "success",
      metadata,
      settings,
      prompt,
      response,
      generatedJson: output,
    }),
  });
}
