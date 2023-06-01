import { RunContext } from "../../../run/RunContext.js";
import { TextEmbeddingModel } from "../../../text/embed/TextEmbeddingModel.js";
import { CohereTextEmbedding } from "./CohereTextEmbedding.js";
import { generateCohereEmbedding } from "./generateCohereEmbedding.js";

export const COHERE_TEXT_EMBEDDING_MODELS = {
  "embed-english-light-v2.0": {
    maxTokens: 4096,
    embeddingDimensions: 1024,
  },
  "embed-english-v2.0": {
    maxTokens: 4096,
    embeddingDimensions: 4096,
  },
  "embed-multilingual-v2.0": {
    maxTokens: 4096,
    embeddingDimensions: 768,
  },
};

export type CohereTextEmbeddingModelType =
  keyof typeof COHERE_TEXT_EMBEDDING_MODELS;

export type CohereTextEmbeddingModelSettings = {
  truncate?: "NONE" | "START" | "END";
};

/**
 * Create a text embedding model that calls the Cohere Co.Embed API.
 *
 * @see https://docs.cohere.com/reference/embed
 *
 * @example
 * const embeddingModel = new CohereTextEmbeddingModel({
 *   apiKey: COHERE_API_KEY,
 *   model: "embed-english-light-v2.0",
 * });
 *
 * const response = await embeddingModel.embed([
 *   "At first, Nox didn't know what to do with the pup.",
 *   "He keenly observed and absorbed everything around him, from the birds in the sky to the trees in the forest.",
 * ]);
 *
 * const embeddings = await embeddingModel.extractEmbeddings(response);
 */
export class CohereTextEmbeddingModel
  implements TextEmbeddingModel<CohereTextEmbedding>
{
  readonly provider = "cohere";

  readonly baseUrl?: string;
  readonly apiKey: string;

  readonly model: CohereTextEmbeddingModelType;
  readonly settings: CohereTextEmbeddingModelSettings;

  readonly maxTextsPerCall = 96;
  readonly maxTextTokens: number;
  readonly embeddingDimensions: number;

  constructor({
    baseUrl,
    apiKey,
    model,
    settings = {},
  }: {
    baseUrl?: string;
    apiKey: string;
    model: CohereTextEmbeddingModelType;
    settings?: CohereTextEmbeddingModelSettings;
  }) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
    this.model = model;
    this.settings = settings;

    this.maxTextTokens = COHERE_TEXT_EMBEDDING_MODELS[model].maxTokens;
    this.embeddingDimensions =
      COHERE_TEXT_EMBEDDING_MODELS[model].embeddingDimensions;
  }

  async embed(
    texts: Array<string>,
    context?: RunContext
  ): Promise<CohereTextEmbedding> {
    if (texts.length > this.maxTextsPerCall) {
      throw new Error(
        `The Cohere embedding API only supports ${this.maxTextsPerCall} texts per API call.`
      );
    }

    return generateCohereEmbedding({
      baseUrl: this.baseUrl,
      abortSignal: context?.abortSignal,
      apiKey: this.apiKey,
      texts,
      model: this.model,
      ...this.settings,
    });
  }

  async extractEmbeddings(
    rawOutput: CohereTextEmbedding
  ): Promise<Array<Array<number>>> {
    return rawOutput.embeddings;
  }

  withSettings(additionalSettings: CohereTextEmbeddingModelSettings) {
    return new CohereTextEmbeddingModel({
      baseUrl: this.baseUrl,
      apiKey: this.apiKey,
      model: this.model,
      settings: Object.assign({}, this.settings, additionalSettings),
    });
  }
}