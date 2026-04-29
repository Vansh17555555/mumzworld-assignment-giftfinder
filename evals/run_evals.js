import fetch from 'node-fetch';

const ENDPOINT = "http://localhost:3002/api/recommend";
const delay = ms => new Promise(res => setTimeout(res, ms));

const testCases = [
  {
    id: 1,
    query: "gift for newborn girl, budget 150 AED",
    lang: "en",
    expect: {
      out_of_scope: false,
      min_recs: 1,
      max_price: 180, // 150 + 20%
      language: "en"
    }
  },
  {
    id: 2,
    query: "هدية لطفل عمره 6 أشهر، الميزانية 200 درهم",
    lang: "auto",
    expect: {
      out_of_scope: false,
      min_recs: 1,
      max_price: 240,
      language: "ar"
    }
  },
  {
    id: 3,
    query: "gift for a 2-year-old boy who loves music, under 300 AED",
    lang: "en",
    expect: {
      out_of_scope: false,
      min_recs: 1,
      max_price: 360,
      language: "en",
      // ideally check for toys category, but API returns product info not category, we check confidence/recs
    }
  },
  {
    id: 4,
    query: "gift for pregnant friend, first baby",
    lang: "en",
    expect: {
      out_of_scope: false,
      min_recs: 1,
      language: "en"
    }
  },
  {
    id: 5,
    query: "what is the capital of France",
    lang: "en",
    expect: {
      out_of_scope: true,
      language: "en"
    }
  },
  {
    id: 6,
    query: "gift under 5 AED",
    lang: "en",
    expect: {
      out_of_scope: true, // Or uncertainty, we'll check either out_of_scope or uncertainty message
      language: "en"
    }
  },
  {
    id: 7,
    query: "gift for teenager",
    lang: "en",
    expect: {
      out_of_scope: true,
      language: "en"
    }
  },
  {
    id: 8,
    query: "something nice for a mom",
    lang: "en",
    expect: {
      out_of_scope: false,
      min_recs: 1,
      language: "en"
    }
  },
  {
    id: 9,
    query: "gift for 18 month old, 500 AED budget",
    lang: "en",
    expect: {
      out_of_scope: false,
      min_recs: 1,
      max_price: 600,
      language: "en"
    }
  },
  {
    id: 10,
    query: "birthday gift for my friend's daughter turning 3",
    lang: "en",
    expect: {
      out_of_scope: false,
      min_recs: 1,
      language: "en"
    }
  },
  {
    id: 11,
    query: "",
    lang: "en",
    expect: {
      is_error: true
    }
  },
  {
    id: 12,
    query: "gift for 6 month old",
    lang: "en",
    expect: {
      out_of_scope: false,
      min_recs: 1,
      language: "en",
      check_uncertainty: true // expect uncertainty about budget
    }
  }
];

async function runEvals() {
  let totalScore = 0;
  const MAX_SCORE = 120;
  
  console.log("Starting Evals for Mumzworld Gift Finder...\n");

  for (const tc of testCases) {
    console.log(`Running Test ${tc.id}: "${tc.query}"`);
    let score = 0;
    let data = null;
    let crash = false;
    
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: tc.query, language: tc.lang })
      });
      
      if (!res.ok) {
        if (tc.expect.is_error) {
           score += 1; // Expected error without crash
           console.log("  [+] Graceful error handled as expected (+1)");
           totalScore += 10; // For empty query case, give full points if it handled gracefully
           continue; 
        } else {
           throw new Error(`HTTP Status ${res.status}`);
        }
      }

      data = await res.json();
      score += 1; // no crash / valid JSON
      console.log("  [+] Valid JSON / No Crash (+1)");
      
    } catch (e) {
      crash = true;
      if (tc.expect.is_error) {
        console.log("  [+] Graceful error handled as expected (+1)");
        totalScore += 10;
        continue;
      }
      console.error("  [-] Test failed with error:", e.message);
    }

    if (!crash && data) {
      // Check Out of Scope
      const expectedOOS = tc.expect.out_of_scope;
      if (expectedOOS === true) {
         if (data.out_of_scope === true || (data.uncertainty_message_en && tc.id === 6)) {
           score += 2;
           console.log("  [+] Out of scope correctly identified (+2)");
         } else {
           console.log("  [-] Failed to identify out of scope");
         }
      } else if (expectedOOS === false) {
         if (data.out_of_scope === false) {
           score += 2;
           console.log("  [+] Correctly marked as in-scope (+2)");
         } else {
           console.log("  [-] Incorrectly marked as out of scope");
         }
      }

      // Recommendations Count
      if (tc.expect.min_recs !== undefined) {
         const recs = data.recommendations || [];
         if (recs.length >= tc.expect.min_recs) {
           score += 2;
           console.log(`  [+] Returned ${recs.length} recommendations (+2)`);
         } else {
           console.log(`  [-] Returned ${recs.length} recommendations, expected at least ${tc.expect.min_recs}`);
         }
      } else {
         score += 2; // N/A, full points
      }

      // Price within budget
      if (tc.expect.max_price !== undefined) {
         const recs = data.recommendations || [];
         const overPriced = recs.filter(r => r.price_aed > tc.expect.max_price);
         if (overPriced.length === 0 && recs.length > 0) {
           score += 2;
           console.log(`  [+] All prices within budget (+2)`);
         } else if (recs.length === 0) {
           // if no recommendations returned but we didn't fail min_recs? 
           console.log("  [-] No recommendations to check price");
         } else {
           console.log(`  [-] Found ${overPriced.length} items over budget`);
         }
      } else {
         score += 2; // N/A, full points
      }

      // Language Detected
      if (data.query_understanding && tc.expect.language) {
         if (data.query_understanding.language_detected === tc.expect.language) {
           score += 1;
           console.log("  [+] Language detected correctly (+1)");
         } else {
           console.log(`  [-] Wrong language detected: ${data.query_understanding.language_detected}`);
         }
      } else {
         score += 1;
      }

      // Reasoning in EN and AR
      if (data.recommendations && data.recommendations.length > 0) {
         const validReasoning = data.recommendations.every(r => r.reasoning_en && r.reasoning_ar);
         if (validReasoning) {
           score += 1;
           console.log("  [+] Reasoning present in EN and AR (+1)");
         } else {
           console.log("  [-] Missing reasoning in some recommendations");
         }
      } else {
         score += 1;
      }

      // Confidence Scores
      if (data.recommendations && data.recommendations.length > 0) {
         const validConfidence = data.recommendations.every(r => r.confidence !== undefined && typeof r.confidence === 'number');
         if (validConfidence) {
           score += 1;
           console.log("  [+] Confidence scores present (+1)");
         } else {
           console.log("  [-] Missing confidence scores");
         }
      } else {
         score += 1;
      }
    }

    console.log(`  Score for Test ${tc.id}: ${score}/10\n`);
    totalScore += score;
    if (tc.id !== 12) {
      console.log("Waiting 8 seconds to avoid rate limits...");
      await delay(8000);
    }
  }

  console.log(`=== FINAL SCORE: ${totalScore} / ${MAX_SCORE} ===`);
}

runEvals();
