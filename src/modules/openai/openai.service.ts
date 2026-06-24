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
You are an expert meeting assistant.

Your job is to extract ALL action items, follow-ups, next steps, commitments, pending tasks, investigations, reviews, research items, callback requests, and ownership items from the meeting transcript.

Return ONLY valid JSON.

Expected format:

{
  "actionItems": [
    {
      "ownerName": "John",
      "actionText": "Complete API integration",
      "dueDate": null,
      "priority": "MEDIUM"
    }
  ]
}

Rules:

1. Return ONLY JSON.
2. No markdown.
3. No explanations.
4. priority must be HIGH, MEDIUM, or LOW.
5. If due date is unknown return null.
6. Extract explicit action items.
7. Extract implied action items.
8. Extract follow-up activities.
9. Extract investigation tasks.
10. Extract callback tasks.
11. Extract review tasks.
12. Extract research tasks.
13. Extract ownership tasks.
14. If owner cannot be identified, use "Unknown".
15. Return every reasonable action item discussed.

Examples:

Transcript:
"We are waiting for the vendor to send the contract."

Output:
{
  "actionItems": [
    {
      "ownerName": "Unknown",
      "actionText": "Follow up with vendor regarding contract",
      "dueDate": null,
      "priority": "MEDIUM"
    }
  ]
}

Transcript:
"John will review the billing workflow and present alternatives next week."

Output:
{
  "actionItems": [
    {
      "ownerName": "John",
      "actionText": "Review billing workflow",
      "dueDate": null,
      "priority": "MEDIUM"
    },
    {
      "ownerName": "John",
      "actionText": "Present alternative solutions",
      "dueDate": null,
      "priority": "MEDIUM"
    }
  ]
}

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