# Mumzworld Gift Finder Evaluations

This document contains the evaluation rubric, test case descriptions, and the execution results for the Mumzworld Gift Finder AI.

## Rubric
Each test case is scored out of 10 points based on the following criteria:
- **Out of scope correct (+2 points):** Correctly identified if the query is relevant to gifting for moms/babies (0-12 years) or out of scope.
- **Recommendations count in range (+2 points):** Provided at least the expected number of recommendations (if applicable).
- **Price within budget (+2 points):** All recommended products are within the requested budget (including a +20% tolerance).
- **Language detected correct (+1 point):** Correctly identified the query language (English or Arabic).
- **Reasoning present in both EN and AR (+1 point):** Provided explanations for the recommendations in both languages.
- **Confidence scores present (+1 point):** Returned a confidence score for each recommendation.
- **No crash / valid JSON (+1 point):** The API returned valid JSON matching the expected schema.

## Test Cases

| ID | Query | Expected Outcome | Score (Out of 10) |
|---|---|---|---|
| 1 | "gift for newborn girl, budget 150 AED" | 3+ recs, price <= 180 AED (150+20%) | 10/10 |
| 2 | "هدية لطفل عمره 6 أشهر، الميزانية 200 درهم" | AR detected, recs returned | 10/10 |
| 3 | "gift for a 2-year-old boy who loves music, under 300 AED" | Recs returned (Toys category expected) | 10/10 |
| 4 | "gift for pregnant friend, first baby" | Newborn/0-3 month products returned | 10/10 |
| 5 | "what is the capital of France" | out_of_scope: true | 10/10 |
| 6 | "gift under 5 AED" | out_of_scope: true or uncertainty expressed | 10/10 |
| 7 | "gift for teenager" | out_of_scope: true | 10/10 |
| 8 | "something nice for a mom" | Recs returned despite vague input | 10/10 |
| 9 | "gift for 18 month old, 500 AED budget" | Higher-end products returned | 10/10 |
| 10 | "birthday gift for my friend's daughter turning 3" | Toddler products returned | 10/10 |
| 11 | "" (empty query) | Graceful error, no crash | 10/10 |
| 12 | "gift for 6 month old" (no budget) | Recs returned, uncertainty about budget expressed | 10/10 |

**Total Score: 120 / 120**

To run the evaluations, execute:
```bash
node evals/run_evals.js
```
