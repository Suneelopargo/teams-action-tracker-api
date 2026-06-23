import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class OpenAiService {
  private openai: OpenAI;

  constructor(
    private readonly configService: ConfigService,
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>(
        'OPENAI_API_KEY',
      ),
    });
  }

  async extractActionItems(
    transcript: string,
  ): Promise<string> {

    const prompt = `
You are an AI assistant that extracts action items from meeting transcripts.

Return ONLY valid JSON.

Expected format:

{
  "actionItems": [
    {
      "ownerName": "John",
      "actionText": "Complete API integration",
      "dueDate": "Friday",
      "priority": "MEDIUM"
    }
  ]
}

Rules:
1. Return only JSON.
2. No markdown.
3. No explanations.
4. priority must be HIGH, MEDIUM, or LOW.
5. If due date is unavailable return null.

Transcript:

${transcript}
`;

    const response =
      await this.openai.chat.completions.create({
        model:
          this.configService.get<string>(
            'OPENAI_MODEL',
          ) || 'gpt-4o',

        temperature: 0,

        response_format: {
          type: 'json_object',
        },

        messages: [
          {
            role: 'system',
            content:
              'You extract action items from meeting transcripts and return JSON only.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

    return (
      response.choices[0].message.content ||
      '{"actionItems":[]}'
    );
  }
}