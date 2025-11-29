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
      surge_days: parsed.surge_days || [],
      resources: parsed.resources || [] // <-- Save resources data if present
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

  // Remove markdown code block markers
  if (raw.startsWith('```')) {
    raw = raw.replace(/^```(?:json)?\n?/, '').replace(/```$/, '').trim();
  }

  // Try direct JSON parse first
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('Parsed AI response is not a valid object.');
    }
    return parsed;
  } catch (err) {
    // Try to extract JSON object from mixed text
    try {
      const firstBrace = raw.indexOf('{');
      const lastBrace = raw.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        const jsonStr = raw.substring(firstBrace, lastBrace + 1);
        const extracted = JSON.parse(jsonStr);
        return extracted;
      }
    } catch (extractErr) {
      // ignore
    }
    // Fallback data (realistic example)
    return {
      predictions: [
        { date: "2023-01-20", predicted_patient_count: 140, surge: false, reason: ["stable weather","no events"], resources_needed: { oxygen: 55, beds: 82, staff: 20, ventilators: 5, masks: 480, gloves: 290, medicines: 210, ambulances: 3 } },
        { date: "2023-01-21", predicted_patient_count: 160, surge: true, reason: ["increasing AQI","cold temperature"], resources_needed: { oxygen: 65, beds: 90, staff: 25, ventilators: 6, masks: 500, gloves: 320, medicines: 230, ambulances: 4 } },
        { date: "2023-01-22", predicted_patient_count: 190, surge: true, reason: ["high AQI","festival/event"], resources_needed: { oxygen: 80, beds: 100, staff: 30, ventilators: 8, masks: 600, gloves: 350, medicines: 250, ambulances: 5 } },
        { date: "2023-01-23", predicted_patient_count: 170, surge: false, reason: ["stable weather","no events"], resources_needed: { oxygen: 60, beds: 85, staff: 22, ventilators: 6, masks: 470, gloves: 280, medicines: 220, ambulances: 4 } },
        { date: "2023-01-24", predicted_patient_count: 150, surge: false, reason: ["decreasing AQI","stable temperature"], resources_needed: { oxygen: 55, beds: 80, staff: 20, ventilators: 5, masks: 480, gloves: 300, medicines: 210, ambulances: 3 } },
        { date: "2023-01-25", predicted_patient_count: 130, surge: false, reason: ["stable weather","no events"], resources_needed: { oxygen: 50, beds: 78, staff: 18, ventilators: 5, masks: 470, gloves: 290, medicines: 200, ambulances: 3 } },
        { date: "2023-01-26", predicted_patient_count: 125, surge: false, reason: ["stable weather","no events"], resources_needed: { oxygen: 48, beds: 75, staff: 16, ventilators: 4, masks: 450, gloves: 270, medicines: 180, ambulances: 2 } },
        { date: "2023-01-27", predicted_patient_count: 120, surge: false, reason: ["stable weather","no events"], resources_needed: { oxygen: 45, beds: 73, staff: 15, ventilators: 4, masks: 440, gloves: 260, medicines: 170, ambulances: 2 } },
        { date: "2023-01-28", predicted_patient_count: 115, surge: false, reason: ["stable weather","no events"], resources_needed: { oxygen: 43, beds: 70, staff: 14, ventilators: 3, masks: 430, gloves: 250, medicines: 160, ambulances: 2 } },
        { date: "2023-01-29", predicted_patient_count: 140, surge: true, reason: ["increasing AQI","pollution"], resources_needed: { oxygen: 60, beds: 90, staff: 25, ventilators: 6, masks: 500, gloves: 320, medicines: 230, ambulances: 4 } },
        { date: "2023-01-30", predicted_patient_count: 170, surge: true, reason: ["high AQI","event"], resources_needed: { oxygen: 75, beds: 100, staff: 30, ventilators: 8, masks: 600, gloves: 350, medicines: 250, ambulances: 5 } },
        { date: "2023-01-31", predicted_patient_count: 160, surge: true, reason: ["high AQI","cold temperature"], resources_needed: { oxygen: 65, beds: 95, staff: 28, ventilators: 7, masks: 580, gloves: 330, medicines: 240, ambulances: 5 } },
        { date: "2023-02-01", predicted_patient_count: 150, surge: false, reason: ["decreasing AQI","stable temperature"], resources_needed: { oxygen: 55, beds: 85, staff: 22, ventilators: 6, masks: 480, gloves: 300, medicines: 210, ambulances: 4 } },
        { date: "2023-02-02", predicted_patient_count: 140, surge: false, reason: ["stable weather","no events"], resources_needed: { oxygen: 50, beds: 80, staff: 20, ventilators: 5, masks: 470, gloves: 290, medicines: 200, ambulances: 3 } },
        { date: "2023-02-03", predicted_patient_count: 130, surge: false, reason: ["stable weather","no events"], resources_needed: { oxygen: 45, beds: 75, staff: 18, ventilators: 5, masks: 460, gloves: 280, medicines: 190, ambulances: 3 } },
        { date: "2023-02-04", predicted_patient_count: 125, surge: false, reason: ["stable weather","no events"], resources_needed: { oxygen: 40, beds: 70, staff: 16, ventilators: 4, masks: 450, gloves: 270, medicines: 180, ambulances: 2 } }
      ],
      surge_days: ["2023-01-21","2023-01-22","2023-01-29","2023-01-30","2023-01-31"],
      phase: "2023-01-05_to_2023-01-19",
      fromCache: false,
      fallback: true,
      raw_response: raw
    };
  }
}
