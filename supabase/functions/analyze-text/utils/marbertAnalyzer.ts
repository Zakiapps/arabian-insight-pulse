// Custom Hugging Face endpoint for MARBERT sentiment analysis
export async function analyzeWithCustomEndpoint(
  text: string, 
  customEndpoint: string, 
  hfToken: string
): Promise<{
  sentiment: string;
  confidence: number;
  positive_prob: number;
  negative_prob: number;
}> {
  try {
    console.log('Starting sentiment analysis with custom MARBERT endpoint...');
    
    const response = await fetch(customEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${hfToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: text,
        parameters: {
          return_all_scores: true
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Custom endpoint error:', response.status, errorText);
      throw new Error(`Custom endpoint error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('Custom endpoint response:', result);

    // Handle the response format from your custom endpoint
    let scores;
    if (Array.isArray(result) && result.length > 0) {
      scores = result[0];
    } else if (result.scores) {
      scores = result.scores;
    } else if (Array.isArray(result)) {
      scores = result;
    } else {
      throw new Error('Unexpected response format from custom endpoint');
    }

    // Find positive and negative scores for MARBERT model
    const positiveScore = scores.find((s: any) => 
      s.label && (
        s.label.toLowerCase().includes('positive') || 
        s.label.toLowerCase().includes('pos') ||
        s.label === 'LABEL_1' ||
        s.label === '1' ||
        s.label === 'POSITIVE'
      )
    );
    
    const negativeScore = scores.find((s: any) => 
      s.label && (
        s.label.toLowerCase().includes('negative') || 
        s.label.toLowerCase().includes('neg') ||
        s.label === 'LABEL_0' ||
        s.label === '0' ||
        s.label === 'NEGATIVE'
      )
    );

    let positive_prob = 0.5;
    let negative_prob = 0.5;

    if (positiveScore && negativeScore) {
      positive_prob = positiveScore.score;
      negative_prob = negativeScore.score;
    } else if (scores.length >= 2) {
      // Fallback: assume first two scores are negative and positive
      negative_prob = scores[0].score;
      positive_prob = scores[1].score;
    }

    const sentiment = positive_prob > negative_prob ? 'positive' : 'negative';
    const confidence = Math.max(positive_prob, negative_prob);

    console.log('Custom MARBERT endpoint analysis completed successfully');

    return {
      sentiment,
      confidence: Math.round(confidence * 10000) / 10000,
      positive_prob: Math.round(positive_prob * 10000) / 10000,
      negative_prob: Math.round(negative_prob * 10000) / 10000
    };

  } catch (error) {
    console.error('Custom endpoint analysis error:', error);
    throw error;
  }
}