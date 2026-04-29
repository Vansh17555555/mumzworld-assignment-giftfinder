import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import { OpenRouter } from "@openrouter/sdk";

dotenv.config();

const app = express();
const port = 3002;

app.use(cors());
app.use(express.json());

const catalog = JSON.parse(fs.readFileSync('./catalog.json', 'utf8'));

const SYSTEM_PROMPT = `You are an expert gift finder assistant for Mumzworld, a premier Middle East e-commerce platform for mothers and babies.
Your job is to recommend the best products from the provided catalog based on the user's query.

CRITICAL INSTRUCTIONS:
1. Return ONLY valid JSON matching this exact schema:
{
  "query_understanding": {
    "recipient_age_months": number | null,
    "budget_aed": number | null,
    "occasion": string | null,
    "language_detected": "en" | "ar"
  },
  "recommendations": [
    {
      "product_id": string,
      "name_en": string,
      "name_ar": string,
      "price_aed": number,
      "reasoning_en": string,
      "reasoning_ar": string,
      "confidence": number
    }
  ],
  "out_of_scope": boolean,
  "uncertainty_message_en": string | null,
  "uncertainty_message_ar": string | null
}

2. Set "out_of_scope": true and return empty "recommendations" IF:
   - The query is not related to gifting for moms/babies/toddlers (0-12 years).
   - No products in the provided catalog match the criteria.
   - Budget is impossibly low (under 20 AED).

3. Always provide reasoning in BOTH English and Arabic, regardless of the user's query language.
4. The Arabic text must read as native, high-quality Middle Eastern copy (not a literal translation).
5. If the age range, budget, or other details are unclear, express uncertainty honestly in the "uncertainty_message_en" and "uncertainty_message_ar" fields.

Here is the subset of the Mumzworld product catalog available for this query:
`;

function parseQuery(query) {
  let budget = null;
  let ageMonths = null;

  // Budget detection
  const budgetMatch = query.match(/(?:under|budget|below|max)\s*(\d+)|(\d+)\s*(?:aed|dh|dirham|درهم)/i);
  if (budgetMatch) {
    budget = parseInt(budgetMatch[1] || budgetMatch[2], 10);
  } else {
    // try to find any standalone number that might be a budget if it's large enough (e.g., > 20) and not an age
    const numbers = [...query.matchAll(/\b(\d+)\b/g)].map(m => parseInt(m[1], 10));
    const potentialBudgets = numbers.filter(n => n >= 30 && n <= 2000);
    if (potentialBudgets.length > 0 && query.toLowerCase().includes('aed') || query.includes('درهم')) {
        budget = potentialBudgets[0];
    } else if (query.match(/(\d+)\s*aed/i)) {
        budget = parseInt(query.match(/(\d+)\s*aed/i)[1], 10);
    }
  }

  // Age detection
  const newbornMatch = query.match(/(?:newborn|infant|حديثي الولادة|رضيع)/i);
  const monthsMatch = query.match(/(\d+)\s*(?:month|mo|شهر|أشهر)/i);
  const yearsMatch = query.match(/(\d+)\s*(?:year|yr|سنة|سنوات)/i);
  
  if (monthsMatch) {
    ageMonths = parseInt(monthsMatch[1], 10);
  } else if (yearsMatch) {
    ageMonths = parseInt(yearsMatch[1], 10) * 12;
  } else if (newbornMatch) {
    ageMonths = 0;
  }

  return { budget, ageMonths };
}

app.post('/api/recommend', async (req, res) => {
  try {
    const { query, language } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    const { budget, ageMonths } = parseQuery(query);
    
    let filteredCatalog = catalog.filter(p => {
      let keep = true;
      if (budget !== null) {
        if (p.price_aed > budget * 1.2) {
          keep = false;
        }
      }
      if (ageMonths !== null) {
        if (ageMonths < p.age_min_months || ageMonths > p.age_max_months) {
          keep = false;
        }
      }
      return keep;
    });

    // If no results after filtering but user had strict filters, we might send an empty list or let AI decide.
    // The instructions say: "If budget mentioned, only send products within 20% above budget... Max 20 products"
    
    // Shuffle and pick 20
    filteredCatalog.sort(() => 0.5 - Math.random());
    const subsetForModel = filteredCatalog.slice(0, 20);

    const catalogContext = JSON.stringify(subsetForModel, null, 2);
    const fullSystemPrompt = SYSTEM_PROMPT + catalogContext;

    const openRouterApiKey = process.env.OPENROUTER_API_KEY;
    if (!openRouterApiKey) {
        console.error("OPENROUTER_API_KEY is missing");
        return res.status(500).json({ error: "Server configuration error" });
    }

    const openrouter = new OpenRouter({ apiKey: openRouterApiKey });
    const response = await openrouter.chat.send({
      chatRequest: {
        model: "nvidia/nemotron-3-nano-30b-a3b:free",
        messages: [
          { role: "system", content: fullSystemPrompt },
          { role: "user", content: query }
        ],
        response_format: { type: "json_object" }
      }
    });

    const aiContent = response.choices[0]?.message?.content;
    if (!aiContent) {
        return res.status(500).json({ error: "Empty response from AI" });
    }

    let aiResponse;
    try {
        aiResponse = JSON.parse(aiContent);
    } catch (e) {
        console.error("Failed to parse AI response JSON:", aiContent);
        return res.status(500).json({ error: "Invalid JSON response from AI" });
    }

    // Basic Schema Validation
    const requiredKeys = ["query_understanding", "recommendations", "out_of_scope"];
    const isValid = requiredKeys.every(k => k in aiResponse);
    if (!isValid) {
        console.error("AI response failed schema validation:", aiResponse);
        return res.status(500).json({ error: "AI response did not match expected schema" });
    }

    res.json(aiResponse);
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(port, () => {
  console.log(`Backend server running on port ${port}`);
});
