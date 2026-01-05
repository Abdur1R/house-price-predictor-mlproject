// StandardScaler implementation
export class StandardScaler {
  private means: number[] = [];
  private stds: number[] = [];
  private fitted = false;

  fit(X: number[][]): void {
    const n = X.length;
    const m = X[0].length;
    
    this.means = new Array(m).fill(0);
    this.stds = new Array(m).fill(0);

    // Calculate means
    for (let j = 0; j < m; j++) {
      let sum = 0;
      for (let i = 0; i < n; i++) {
        sum += X[i][j];
      }
      this.means[j] = sum / n;
    }

    // Calculate standard deviations
    for (let j = 0; j < m; j++) {
      let sumSq = 0;
      for (let i = 0; i < n; i++) {
        sumSq += Math.pow(X[i][j] - this.means[j], 2);
      }
      this.stds[j] = Math.sqrt(sumSq / n) || 1; // Avoid division by zero
    }

    this.fitted = true;
  }

  transform(X: number[][]): number[][] {
    if (!this.fitted) throw new Error("Scaler not fitted");
    
    return X.map(row => 
      row.map((val, j) => (val - this.means[j]) / this.stds[j])
    );
  }

  fitTransform(X: number[][]): number[][] {
    this.fit(X);
    return this.transform(X);
  }

  getParams() {
    return { means: this.means, stds: this.stds };
  }
}

// SGDRegressor implementation
export class SGDRegressor {
  private weights: number[] = [];
  private bias = 0;
  private learningRate: number;
  private maxIter: number;
  private fitted = false;

  constructor(learningRate = 0.01, maxIter = 1000) {
    this.learningRate = learningRate;
    this.maxIter = maxIter;
  }

  fit(X: number[][], y: number[]): { losses: number[] } {
    const n = X.length;
    const m = X[0].length;
    
    // Initialize weights
    this.weights = new Array(m).fill(0);
    this.bias = 0;
    
    const losses: number[] = [];

    for (let iter = 0; iter < this.maxIter; iter++) {
      // Shuffle indices for SGD
      const indices = [...Array(n).keys()].sort(() => Math.random() - 0.5);
      
      let totalLoss = 0;
      
      for (const i of indices) {
        // Predict
        let prediction = this.bias;
        for (let j = 0; j < m; j++) {
          prediction += this.weights[j] * X[i][j];
        }
        
        // Calculate error
        const error = prediction - y[i];
        totalLoss += error * error;
        
        // Update weights and bias
        for (let j = 0; j < m; j++) {
          this.weights[j] -= this.learningRate * error * X[i][j];
        }
        this.bias -= this.learningRate * error;
      }
      
      // Decay learning rate
      if (iter % 100 === 0) {
        this.learningRate *= 0.95;
      }
      
      losses.push(totalLoss / n);
    }

    this.fitted = true;
    return { losses };
  }

  predict(X: number[][]): number[] {
    if (!this.fitted) throw new Error("Model not fitted");
    
    return X.map(row => {
      let prediction = this.bias;
      for (let j = 0; j < row.length; j++) {
        prediction += this.weights[j] * row[j];
      }
      return prediction;
    });
  }

  getCoefficients() {
    return { weights: this.weights, bias: this.bias };
  }
}

// Combined model that handles scaling + prediction
export interface TrainedModel {
  scaler: StandardScaler;
  regressor: SGDRegressor;
}

export function trainModel(X: number[][], y: number[]): TrainedModel {
  const scaler = new StandardScaler();
  const X_norm = scaler.fitTransform(X);
  
  const regressor = new SGDRegressor(0.01, 1000);
  regressor.fit(X_norm, y);
  
  return { scaler, regressor };
}

export function predictWithModel(model: TrainedModel, X: number[][]): number[] {
  const X_norm = model.scaler.transform(X);
  return model.regressor.predict(X_norm);
}

// Parse CSV data
export function parseCSVData(csvText: string): { X: number[][]; y: number[] } | null {
  try {
    const lines = csvText.trim().split('\n');
    const dataLines = lines[0].includes(',') && isNaN(parseFloat(lines[0].split(',')[0])) 
      ? lines.slice(1) 
      : lines;
    
    const X: number[][] = [];
    const y: number[] = [];
    
    for (const line of dataLines) {
      if (!line.trim()) continue;
      const values = line.split(',').map(v => parseFloat(v.trim()));
      if (values.length >= 5 && values.every(v => !isNaN(v))) {
        X.push(values.slice(0, 4));
        y.push(values[4]);
      }
    }
    
    if (X.length === 0) return null;
    return { X, y };
  } catch {
    return null;
  }
}
