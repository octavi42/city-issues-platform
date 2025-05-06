/**
 * Schema definitions for the City-Vision-Inspector API
 * Generated from OpenAPI specification
 */

// API specification as a TypeScript object
export const apiSchema = {
  openapi: "3.0.0",
  info: {
    title: "City-Vision-Inspector API",
    version: "0.1.0"
  },
  servers: [
    {
      url: "http://{host}:{port}",
      variables: {
        host: {
          default: "localhost"
        },
        port: {
          default: "8000"
        }
      }
    }
  ],
  paths: {
    "/analyze": {
      post: {
        summary: "Receive image, user, and location for analysis",
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  image: {
                    type: "string",
                    format: "binary",
                    description: "The photo file to analyze"
                  },
                  user_id: {
                    type: "string",
                    description: "ID of the user uploading the photo"
                  },
                  location: {
                    type: "object",
                    description: "Location info",
                    properties: {
                      latitude: { type: "number" },
                      longitude: { type: "number" },
                      city: { type: "string" },
                      country: { type: "string" }
                    },
                    required: ["latitude", "longitude", "city", "country"]
                  }
                },
                required: ["image", "user_id", "location"]
              }
            }
          }
        },
        responses: {
          "200": {
            description: "Structured analysis result from the agent",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  additionalProperties: true
                }
              }
            }
          },
          "400": { description: "Bad Request (e.g. malformed location JSON)" },
          "500": { description: "Internal Server Error (upload or analysis failure)" }
        }
      }
    },
    "/relevance": {
      post: {
        summary: "Adjust relevance score based on user feedback",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/RelevanceRequest"
              }
            }
          }
        },
        responses: {
          "200": {
            description: "Delta score returned",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    delta_score: { type: "number" }
                  },
                  required: ["delta_score"]
                }
              }
            }
          },
          "404": { description: "Photo or linked event not found" },
          "500": { description: "Internal Server Error (agent failure)" }
        }
      }
    }
  },
  components: {
    schemas: {
      RelevanceRequest: {
        type: "object",
        properties: {
          photo_id: { type: "string" },
          user_id: { type: "string" },
          additional_info: { type: "string" }
        },
        required: ["photo_id", "user_id", "additional_info"]
      }
    }
  }
};
