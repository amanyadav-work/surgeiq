'use server';

import Groq from 'groq-sdk';
import { dbConnect, SurgePrediction } from '@/lib/mongoose';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function GenerateAiDataGroq(
  messages,
  systemPrompt = `You are a supportive and professional AI prediction system. Speak like a friendly mentor...`,
  image,
  ignoreFormat = false,
  phase = null // new param for phase
) {
  await dbConnect();

  // Determine phase from dummy data (first and last date)
  if (!phase && messages && messages[0]?.content) {
    const match = messages[0].content.match(/\| (\d{4}-\d{2}-\d{2}) \|.*\| (\d{4}-\d{2}-\d{2}) \|/s);
    if (match) {
      phase = `${match[1]}_to_${match[2]}`;
    } else {
      // fallback: try to extract first and last date from table
      const dates = Array.from(messages[0].content.matchAll(/\| (\d{4}-\d{2}-\d{2}) \|/g)).map(m => m[1]);
      if (dates.length > 1) phase = `${dates[0]}_to_${dates[dates.length-1]}`;
      else phase = 'unknown_phase';
    }
  }

  // Check if prediction exists for this phase
  const existing = await SurgePrediction.findOne({ phase });
  if (existing) {
    return {
      predictions: existing.predictions,
      surge_days: existing.surge_days,
      phase: existing.phase,
      fromCache: true
    };
  }

  if (!Array.isArray(messages)) {
    throw new Error('Invalid input: messages must be an array.');
  }

  const fullMessages = messages.map((msg, index) => {
    if (image && image.length > 0 && msg.role === 'user' && index === messages.length - 1) {
      return {
        role: 'user',
        content: [
          { type: 'text', text: msg.content },
          { type: 'image_url', image_url: { url: image } },
        ],
      };
    }
    return msg;
  });

  fullMessages.unshift({ role: 'system', content: systemPrompt });

  try {
    const completion = await groq.chat.completions.create({
      messages: fullMessages,
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      temperature: 1,
      max_completion_tokens: 2048,
      top_p: 1,
      stream: false,
    });

    const raw = completion.choices[0].message.content.trim();
    const parsed = await parseAiJsonResponse(raw, ignoreFormat);

    // Store in DB
    await SurgePrediction.create({
      phase,
      predictions: parsed.predictions || [],
      surge_days: parsed.surge_days || []
    });

    return { ...parsed, phase, fromCache: false };
  } catch (error) {
    console.error('[GROQ AI ERROR]', error);
    throw new Error('Failed to generate or parse response.');
  }
}



export async function parseAiJsonResponse(raw, ignoreFormat) {
  if (typeof raw !== 'string') {
    throw new Error('Expected a string from AI, got ' + typeof raw);
  }

  raw = raw.trim();
  if (raw.startsWith('```')) {
    raw = raw.replace(/^```(?:json)?\n?/, '').replace(/```$/, '').trim();
  }

  try {
    console.log({ ignoreFormat })
    const parsed = JSON.parse(raw);

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('Parsed AI response is not a valid object.');
    }

    return parsed;
  } catch (err) {
    // Try to extract JSON from the text
    try {
      const match = raw.match(/{[\s\S]*}/);
      if (match) {
        const extracted = JSON.parse(match[0]);
        return extracted;
      }
    } catch (extractErr) {
      // ignore
    }
    // Fallback data
    return {
      predictions: [],
      surge_days: [],
      fallback: true,
      raw_response: raw
    };
  }
}
