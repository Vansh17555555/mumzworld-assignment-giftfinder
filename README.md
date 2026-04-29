# Mumzworld Gift Finder

An AI-powered gift finder for Mumzworld, designed to understand natural language queries (in English or Arabic) and recommend the perfect products for babies and mothers. 

Built with React, Tailwind CSS, Express, and NVIDIA Nemotron-3-Nano-30B via OpenRouter.

## Setup

Get the application running in under 5 minutes.

### Prerequisites
- Node.js (v18 or higher recommended)
- An OpenRouter API Key

### 1. Clone & Configure
```bash
# Clone the repository (if not already done)
# cd mumzworld-assignment

# Set up the backend environment
cp backend/.env.example backend/.env
# Edit backend/.env and add your OPENROUTER_API_KEY
```

### 2. Start the Backend
```bash
cd backend
npm install
node index.js
```
The server will start on `http://localhost:3002`.

### 3. Start the Frontend
In a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
Open your browser to `http://localhost:5173`.

## How it works

1. **User Input:** The user enters a natural language query (e.g., "thoughtful gift for a 6-month-old, under 200 AED") in the React frontend.
2. **Filtering:** The Express backend parses the query for budget and age constraints, pre-filtering the mock product catalog to a relevant subset (max 20 items).
3. **AI Reasoning:** The filtered catalog and query are sent to the NVIDIA Nemotron-3-Nano model via OpenRouter. The model uses a strict system prompt to output a JSON schema containing query understanding, recommendations, and bilingual reasoning (English and Arabic).
4. **Display:** The frontend renders the structured data, highlighting the AI's understanding of the query and presenting the products with detailed, localized reasoning.

## Evals

To evaluate the AI's performance against 12 predefined test cases:
```bash
# In the root directory (or from the evals directory if configured)
cd evals
npm install node-fetch # if required depending on your node version
node run_evals.js
```
Detailed results will be printed to the console, scoring the model out of 120 possible points. See `EVALS.md` for the full rubric.

## Tooling
- **Frontend:** React, Vite, Tailwind CSS
- **Backend:** Node.js, Express, dotenv
- **AI Integration:** OpenRouter (Model: `nvidia/nemotron-3-nano-30b-a3b:free`)
- **Testing:** Custom Node.js evaluation script

## Tradeoffs Summary
A Gift Finder was chosen to directly address decision fatigue in baby/mom e-commerce. NVIDIA Nemotron-3-Nano was selected for its high performance and low latency. A mock catalog ensures deterministic testing and rich bilingual data without the fragility of web scraping. Future iterations would include a vector database for semantic search across the full catalog, product images, and direct cart integration. For full details, see `TRADEOFFS.md`.
