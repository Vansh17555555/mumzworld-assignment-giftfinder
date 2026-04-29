# Tradeoffs

## Why a Gift Finder over other options?
I chose to build a Gift Finder because it directly addresses a common, high-friction problem in e-commerce: decision fatigue. Finding a gift for a baby or mother often involves navigating complex age ranges, developmental stages, and safety requirements. A semantic, natural language interface is uniquely suited to solve this by synthesizing these constraints into curated recommendations. Unlike a review synthesizer (which assumes the user already found a product) or a return classifier (which operates post-purchase), a Gift Finder acts at the top of the funnel, driving immediate engagement and potential revenue.

## Why NVIDIA Nemotron-3-Nano-30B via OpenRouter?
NVIDIA's Nemotron-3-Nano-30B offers a compelling balance of strong reasoning capabilities with low latency and cost, especially when accessed via OpenRouter's free tier. While larger models like GPT-4o might have a slight edge in complex logic, Nemotron-3-Nano is more than capable of the filtering, JSON schema generation, and multi-lingual reasoning required here. The OpenRouter SDK provides a unified API, avoiding lock-in and allowing easy model swapping if needed.

## Why a mock catalog over real scraping?
Scraping the live Mumzworld site introduces fragility: the application would break if they change their DOM structure. Furthermore, scraping limits the speed of the application since we would either need to scrape on the fly (very slow) or build a complex indexing pipeline. A curated mock catalog allows deterministic testing, ensures high-quality localized Arabic data, and perfectly demonstrates the AI's reasoning capabilities without the overhead of maintaining a web scraper.

## What was cut?
Given the time constraints, several features were scoped out:
- **User History & Session State:** The app does not remember previous queries or preferences.
- **Cart Integration:** Users cannot directly add items to a cart from the interface.
- **Image Search:** We omitted product images to simplify the UI and focus strictly on the text/reasoning output of the LLM.
- **Pagination:** The catalog subset is limited to 20 items per query for context window efficiency, rather than a full vector search across thousands of products.

## Known Failure Modes
- **Vague Queries:** Queries like "nice gift" might yield overly generic results due to lack of constraints.
- **Code-Switching:** Queries mixing English and Arabic (e.g., "gift for my طفل under 100 AED") might confuse the language detection step, potentially leading to suboptimal reasoning formatting.
- **Extremely Niche Constraints:** Queries requiring highly specific product knowledge not present in the mock descriptions might result in hallucinations or generic advice.

## What would be built next?
With more time, I would implement:
1. **Vector Database Integration:** Moving from a static JSON file to a vector DB (like Pinecone) to support semantic search over a massive product catalog.
2. **Product Images:** Fetching and displaying actual product images.
3. **Conversational Multi-Turn UX:** Allowing users to refine their search (e.g., "Actually, make it under 100 AED instead").
4. **Direct Cart Addition:** Deep linking directly into the Mumzworld checkout flow.
