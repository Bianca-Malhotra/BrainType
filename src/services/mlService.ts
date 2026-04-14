import * as tf from '@tensorflow/tfjs';

export interface SessionData {
  wpm: number;
  accuracy: number;
  timestamp: number;
}

/**
 * Predicts the next WPM based on session history using a simple linear regression model.
 * @param history Array of previous session results
 * @returns Predicted WPM for the next session
 */
export async function predictNextWpm(history: SessionData[]): Promise<number> {
  if (history.length < 3) {
    // Not enough data for a meaningful prediction, return average or a default
    if (history.length === 0) return 60;
    return history.reduce((acc, curr) => acc + curr.wpm, 0) / history.length;
  }

  // Prepare data: x is the index (time), y is the WPM
  // We'll use the last 10 sessions if available
  const recentHistory = history.slice(0, 10).reverse();
  const xs = recentHistory.map((_, i) => i);
  const ys = recentHistory.map(h => h.wpm);

  // Create a simple linear model: y = mx + b
  const model = tf.sequential();
  model.add(tf.layers.dense({ units: 1, inputShape: [1] }));

  model.compile({ loss: 'meanSquaredError', optimizer: 'sgd' });

  // Convert to tensors
  const xsTensor = tf.tensor2d(xs, [xs.length, 1]);
  const ysTensor = tf.tensor2d(ys, [ys.length, 1]);

  // Normalize data slightly for better convergence (optional for simple linear)
  // Train the model
  await model.fit(xsTensor, ysTensor, { epochs: 100, verbose: 0 });

  // Predict the next value (index xs.length)
  const nextX = tf.tensor2d([xs.length], [1, 1]);
  const prediction = model.predict(nextX) as tf.Tensor;
  const predictedValue = (await prediction.data())[0];

  // Cleanup
  xsTensor.dispose();
  ysTensor.dispose();
  nextX.dispose();
  prediction.dispose();
  model.dispose();

  // Return predicted value, clamped to a reasonable range
  const lastWpm = history[0].wpm;
  // Don't predict something wildly different from the last WPM
  return Math.max(10, Math.min(200, Math.round(predictedValue)));
}

/**
 * Calculates a "Buddy" speed. 
 * This is the predicted WPM plus a small challenge factor (e.g., 5%).
 */
export async function getBuddyTargetWpm(history: SessionData[]): Promise<number> {
  const predicted = await predictNextWpm(history);
  // Add a 5% challenge to push the user
  return Math.round(predicted * 1.05);
}
