import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
  dangerouslyAllowBrowser: true,
});

export const generateMarketInsight = async (marketData, userPortfolio) => {
  try {
    const prompt = `
    As a financial advisor, analyze the following market data and user portfolio to provide insights:
    
    Market Data: ${JSON.stringify(marketData)}
    User Portfolio: ${JSON.stringify(userPortfolio)}
    
    Provide a concise analysis covering:
    1. Current market trends
    2. Portfolio performance assessment
    3. Potential opportunities or risks
    4. Specific recommendations
    
    Keep the response professional and actionable, under 300 words.
    `;

    const response = await openai.chat.completions.create({
      model: "google/gemini-2.0-flash-001",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 500,
      temperature: 0.7,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error generating market insight:', error);
    return 'Unable to generate market insights at this time. Please try again later.';
  }
};

export const generatePersonalizedRecommendations = async (userProfile, marketConditions) => {
  try {
    const prompt = `
    Based on the user's financial profile and current market conditions, provide personalized investment recommendations:
    
    User Profile: ${JSON.stringify(userProfile)}
    Market Conditions: ${JSON.stringify(marketConditions)}
    
    Provide 3-5 specific, actionable recommendations considering:
    1. Risk tolerance
    2. Investment timeline
    3. Current market volatility
    4. Diversification needs
    
    Format as numbered recommendations with brief explanations.
    `;

    const response = await openai.chat.completions.create({
      model: "google/gemini-2.0-flash-001",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 400,
      temperature: 0.8,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return 'Unable to generate recommendations at this time. Please try again later.';
  }
};

export const analyzeNewsImpact = async (newsItems, userPortfolio) => {
  try {
    const prompt = `
    Analyze how the following news items might impact the user's portfolio:
    
    News: ${JSON.stringify(newsItems)}
    Portfolio Holdings: ${JSON.stringify(userPortfolio)}
    
    Provide a brief impact assessment covering:
    1. Relevance to portfolio holdings
    2. Potential short-term effects
    3. Long-term implications
    4. Recommended actions if any
    
    Keep the analysis concise and focused on actionable insights.
    `;

    const response = await openai.chat.completions.create({
      model: "google/gemini-2.0-flash-001",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 350,
      temperature: 0.6,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error analyzing news impact:', error);
    return 'Unable to analyze news impact at this time. Please try again later.';
  }
};
