import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { analyzeWithCustomEndpoint } from './marbertAnalyzer.ts';

// Validate model with test data
export async function validateWithTestData(
  supabase: any,
  customEndpoint: string,
  hfToken: string
): Promise<void> {
  try {
    console.log('Loading test.csv for validation...');
    
    const { data: testData, error } = await supabase.storage
      .from('private-model')
      .download('test.csv');
    
    if (error || !testData) {
      console.log('Test data not found, skipping validation');
      return;
    }
    
    const csvText = await testData.text();
    const lines = csvText.split('\n').slice(1, 6); // Take first 5 test samples
    
    let correct = 0;
    let total = 0;
    
    for (const line of lines) {
      if (!line.trim()) continue;
      
      const [text, expectedLabel] = line.split(',').map(col => col.trim().replace(/"/g, ''));
      if (!text || !expectedLabel) continue;
      
      try {
        const result = await analyzeWithCustomEndpoint(text, customEndpoint, hfToken);
        const predicted = result.sentiment === 'positive' ? '1' : '0';
        
        if (predicted === expectedLabel) correct++;
        total++;
        
        console.log(`Test: "${text.substring(0, 30)}..." | Expected: ${expectedLabel} | Predicted: ${predicted} | Confidence: ${result.confidence}`);
      } catch (err) {
        console.error('Error validating sample:', err);
      }
    }
    
    if (total > 0) {
      const accuracy = (correct / total * 100).toFixed(1);
      console.log(`Validation accuracy: ${accuracy}% (${correct}/${total})`);
    }
    
  } catch (error) {
    console.error('Validation error:', error);
  }
}