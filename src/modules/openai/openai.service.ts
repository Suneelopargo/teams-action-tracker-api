import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class OpenAiService {
  private openai: OpenAI;

  constructor(private readonly configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  async extractActionItems(transcript: string): Promise<string> {
    const prompt = `
You are an expert meeting assistant for Microsoft Teams meeting transcripts.

Your job is to extract ALL action items, follow-ups, next steps, commitments, pending tasks, investigations, reviews, research items, callback requests, and ownership items from the meeting transcript.

Return ONLY valid JSON.

Expected format:

{
  "actionItems": [
    {
      "ownerName": "John Smith",
      "ownerEmail": "john.smith@company.com",
      "actionText": "Complete API integration",
      "dueDate": "2026-07-03",
      "priority": "MEDIUM"
    }
  ]
}

Required fields for every action item:

- ownerName: Person responsible for the task. Use the most complete name available.
- ownerEmail: Email address for the owner when it is present or can be confidently inferred from the transcript participant metadata. Use null when unknown.
- actionText: Clear, specific task text written as an action.
- dueDate: ISO date string in YYYY-MM-DD format when a due date is explicitly stated or strongly implied. Use null when unknown.
- priority: One of HIGH, MEDIUM, or LOW.

Rules:

1. Return ONLY JSON.
2. No markdown.
3. No explanations.
4. Do not add fields outside the expected format.
5. priority must be HIGH, MEDIUM, or LOW.
6. If due date is unknown, return null.
7. If owner email is unknown, return null.
8. If owner cannot be identified, use ownerName "Unknown" and ownerEmail null.
9. Prefer an exact speaker or participant email from the transcript over guessing.
10. Do not invent email addresses.
11. Extract explicit action items.
12. Extract implied action items.
13. Extract follow-up activities.
14. Extract investigation tasks.
15. Extract callback tasks.
16. Extract review tasks.
17. Extract research tasks.
18. Extract ownership tasks.
19. Split separate commitments into separate action items.
20. Return every reasonable action item discussed.

Priority guidance:

- HIGH: urgent, blocking, production-impacting, executive/customer escalated, or due within 2 days.
- MEDIUM: normal committed work, follow-up, review, implementation, investigation, or due this week.
- LOW: optional, informational, future consideration, or no clear urgency.

Examples:

Transcript:
"Participants: John Smith <john.smith@company.com>. John will review the billing workflow by Friday."

Output:
{
  "actionItems": [
    {
      "ownerName": "John Smith",
      "ownerEmail": "john.smith@company.com",
      "actionText": "Review the billing workflow",
      "dueDate": null,
      "priority": "MEDIUM"
    }
  ]
}

Transcript:
"We are waiting for the vendor to send the contract."

Output:
{
  "actionItems": [
    {
      "ownerName": "Unknown",
      "ownerEmail": null,
      "actionText": "Follow up with vendor regarding the contract",
      "dueDate": null,
      "priority": "MEDIUM"
    }
  ]
}

Transcript:
"Priya Patel <priya@company.com> will fix the login blocker today and present alternatives next week."

Output:
{
  "actionItems": [
    {
      "ownerName": "Priya Patel",
      "ownerEmail": "priya@company.com",
      "actionText": "Fix the login blocker",
      "dueDate": null,
      "priority": "HIGH"
    },
    {
      "ownerName": "Priya Patel",
      "ownerEmail": "priya@company.com",
      "actionText": "Present alternative solutions",
      "dueDate": null,
      "priority": "MEDIUM"
    }
  ]
}

Transcript:

${transcript}
`;

    const response = await this.openai.chat.completions.create({
      model: this.configService.get<string>('OPENAI_MODEL') || 'gpt-4o',
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

    return response.choices[0].message.content || '{"actionItems":[]}';
  }
}
