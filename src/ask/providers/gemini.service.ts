import { Injectable, BadRequestException } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import { MathSolutionResponse } from '../dto/math-solution.dto';
import { ALLOWED_MIME_TYPES, PROMPT } from 'src/common/constants';

@Injectable()
export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }

  async sendImageAndGetAnswer(
    image: Express.Multer.File,
  ): Promise<MathSolutionResponse> {
    try {
      if (!ALLOWED_MIME_TYPES.includes(image.mimetype)) {
        throw new BadRequestException(
          'Invalid image format. Only JPEG, PNG, and WebP are supported',
        );
      }

      // Convert image buffer to base64
      const imageBase64 = image.buffer.toString('base64');

      // Generate content with image using the latest SDK structure
      const response = await this.ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: [
          {
            role: 'user',
            parts: [
              { text: PROMPT },
              {
                inlineData: {
                  data: imageBase64,
                  mimeType: image.mimetype,
                },
              },
            ],
          },
        ],
      });

      if (!response.text) {
        throw new Error('No response generated from Gemini API');
      }

      const usageMetadata = response.usageMetadata;
      if (usageMetadata) {
        console.log('Token Usage for sendImageAndGetAnswer:');
        console.log('  Prompt Token Count:', usageMetadata.promptTokenCount);
        console.log(
          '  Candidates Token Count:',
          usageMetadata.candidatesTokenCount,
        );
        console.log('  Total Token Count:', usageMetadata.totalTokenCount);
      }

      // Parse the response to extract structured data
      const parsedResponse = this.parseGeminiResponse(response.text);

      return parsedResponse;
    } catch (error) {
      console.error('Error in sendImageAndGetAnswer:', error);

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new Error(`Failed to process math problem: `);
    }
  }

  private parseGeminiResponse(text: string): MathSolutionResponse {
    try {
      // Initialize default response
      let detailedSolution = '';
      let trickyToSolveFast = '';

      // Split the text by the expected format markers
      const lines = text.split('\n');
      let currentSection = '';
      const detailedLines: string[] = [];
      const trickyLines: string[] = [];

      for (const line of lines) {
        const trimmedLine = line.trim();

        if (trimmedLine.toLowerCase().includes('detailedSolution:')) {
          currentSection = 'detailed';
          continue;
        } else if (trimmedLine.toLowerCase().includes('trickyToSolveFast:')) {
          currentSection = 'tricky';
          continue;
        }

        if (currentSection === 'detailed' && trimmedLine) {
          detailedLines.push(trimmedLine);
        } else if (currentSection === 'tricky' && trimmedLine) {
          trickyLines.push(trimmedLine);
        }
      }

      detailedSolution = detailedLines.join('\n').trim();
      trickyToSolveFast = trickyLines.join('\n').trim();

      // Fallback parsing if the structured format wasn't followed
      if (!detailedSolution && !trickyToSolveFast) {
        // Try alternative parsing methods
        const detailedMatch = text.match(
          /detailedSolution:\s*([\s\S]*?)(?=trickyToSolveFast:|$)/i,
        );
        const trickyMatch = text.match(/trickyToSolveFast:\s*([\s\S]*?)$/i);

        detailedSolution = detailedMatch
          ? detailedMatch[1].trim()
          : text.substring(0, text.length / 2);
        trickyToSolveFast = trickyMatch
          ? trickyMatch[1].trim()
          : 'Quick solving techniques will be provided based on the problem type.';
      }

      // Ensure we have content for both fields
      if (!detailedSolution) {
        detailedSolution =
          'Unable to parse detailed solution from the response.';
      }
      if (!trickyToSolveFast) {
        trickyToSolveFast =
          'Quick solving techniques will be analyzed and provided.';
      }

      return {
        detailedSolution,
        trickyToSolveFast,
      };
    } catch (error) {
      console.error('Error parsing Gemini response:', error);
      return {
        detailedSolution: 'Error parsing the detailed solution.',
        trickyToSolveFast: 'Error parsing quick solving techniques.',
      };
    }
  }

  // Additional utility method to validate math problem images
  async validateMathImage(image: Express.Multer.File): Promise<boolean> {
    try {
      const imageBase64 = image.buffer.toString('base64');

      const response = await this.ai.models.generateContent({
        model: 'gemini-2.0-flash-001',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: 'Does this image contain a mathematical problem or equation? Respond with only "YES" or "NO".',
              },
              {
                inlineData: {
                  data: imageBase64,
                  mimeType: image.mimetype,
                },
              },
            ],
          },
        ],
      });

      const text = response.text?.trim().toUpperCase();
      return text?.includes('YES') || false;
    } catch (error) {
      console.error('Error validating math image:', error);
      return true; // Default to true to allow processing
    }
  }
}
