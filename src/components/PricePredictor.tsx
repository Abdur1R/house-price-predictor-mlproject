import { useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Home, BedDouble, Layers, Calendar, TrendingUp, Sparkles } from "lucide-react";
import { TrainedModel, predictWithModel } from "@/lib/ml";

interface PredictionInputs {
  size: number;
  bedrooms: number;
  floors: number;
  age: number;
}

interface PricePredictorProps {
  trainedModel: TrainedModel | null;
}

// Fallback prediction when no model is trained
const fallbackPredict = (inputs: PredictionInputs): number => {
  const { size, bedrooms, floors, age } = inputs;
  const basePrice = 150000;
  const sizeCoef = 180;
  const bedroomCoef = 25000;
  const floorCoef = 15000;
  const ageCoef = -2000;
  
  return Math.max(50000, basePrice + (size * sizeCoef) + (bedrooms * bedroomCoef) + (floors * floorCoef) + (age * ageCoef));
};

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(price);
};

const InputCard = ({ 
  icon: Icon, 
  label, 
  value, 
  unit, 
  min, 
  max, 
  step = 1,
  onChange 
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
}) => (
  <div className="group bg-card rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300 border border-border/50">
    <div className="flex items-center gap-3 mb-4">
      <div className="p-2.5 rounded-xl bg-gradient-accent/10 text-accent group-hover:bg-gradient-accent group-hover:text-accent-foreground transition-all duration-300">
        <Icon className="w-5 h-5" />
      </div>
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
    </div>
    <div className="flex items-baseline gap-2 mb-5">
      <span className="text-3xl font-bold text-foreground">{value.toLocaleString()}</span>
      <span className="text-sm text-muted-foreground">{unit}</span>
    </div>
    <Slider
      value={[value]}
      onValueChange={(v) => onChange(v[0])}
      min={min}
      max={max}
      step={step}
      className="w-full"
    />
    <div className="flex justify-between mt-2 text-xs text-muted-foreground">
      <span>{min.toLocaleString()}</span>
      <span>{max.toLocaleString()}</span>
    </div>
  </div>
);

const AnimatedPrice = ({ price }: { price: number }) => {
  const [displayPrice, setDisplayPrice] = useState(price);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsAnimating(true);
    const duration = 500;
    const startPrice = displayPrice;
    const diff = price - startPrice;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      
      setDisplayPrice(Math.round(startPrice + diff * eased));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
      }
    };
    
    requestAnimationFrame(animate);
  }, [price]);

  return (
    <span className={`transition-all duration-300 ${isAnimating ? 'scale-105' : 'scale-100'}`}>
      {formatPrice(displayPrice)}
    </span>
  );
};

export default function PricePredictor({ trainedModel }: PricePredictorProps) {
  const [inputs, setInputs] = useState<PredictionInputs>({
    size: 1500,
    bedrooms: 3,
    floors: 2,
    age: 10,
  });
  const [predictedPrice, setPredictedPrice] = useState<number | null>(null);
  const [hasCalculated, setHasCalculated] = useState(false);

  const predictPrice = (inputData: PredictionInputs): number => {
    if (trainedModel) {
      const X = [[inputData.size, inputData.bedrooms, inputData.floors, inputData.age]];
      const prediction = predictWithModel(trainedModel, X);
      return Math.max(50000, prediction[0]);
    }
    return fallbackPredict(inputData);
  };

  const handlePredict = () => {
    const price = predictPrice(inputs);
    setPredictedPrice(price);
    setHasCalculated(true);
  };

  useEffect(() => {
    if (hasCalculated) {
      const price = predictPrice(inputs);
      setPredictedPrice(price);
    }
  }, [inputs, hasCalculated, trainedModel]);

  // Re-predict when model changes
  useEffect(() => {
    if (hasCalculated && trainedModel) {
      const price = predictPrice(inputs);
      setPredictedPrice(price);
    }
  }, [trainedModel]);

  return (
    <div className="w-full max-w-4xl mx-auto">
      {!trainedModel && (
        <div className="mb-6 p-4 rounded-xl bg-muted/50 border border-border text-center">
          <p className="text-sm text-muted-foreground">
            Using default coefficients. Train a model above for custom predictions.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
        <InputCard
          icon={Home}
          label="Living Area"
          value={inputs.size}
          unit="sq ft"
          min={500}
          max={5000}
          step={50}
          onChange={(size) => setInputs({ ...inputs, size })}
        />
        <InputCard
          icon={BedDouble}
          label="Bedrooms"
          value={inputs.bedrooms}
          unit="rooms"
          min={1}
          max={10}
          onChange={(bedrooms) => setInputs({ ...inputs, bedrooms })}
        />
        <InputCard
          icon={Layers}
          label="Floors"
          value={inputs.floors}
          unit="levels"
          min={1}
          max={8}
          onChange={(floors) => setInputs({ ...inputs, floors })}
        />
        <InputCard
          icon={Calendar}
          label="Property Age"
          value={inputs.age}
          unit="years"
          min={0}
          max={50}
          onChange={(age) => setInputs({ ...inputs, age })}
        />
      </div>

      {!hasCalculated ? (
        <Button 
          variant="hero" 
          size="xl" 
          onClick={handlePredict}
          className="w-full md:w-auto mx-auto flex"
        >
          <Sparkles className="w-5 h-5" />
          Estimate Property Value
        </Button>
      ) : (
        <div className="animate-scale-in">
          <div className="bg-card rounded-2xl p-8 shadow-card-hover border border-accent/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-accent/5" />
            <div className="relative">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-gradient-accent text-accent-foreground">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  {trainedModel ? "ML Predicted Value" : "Estimated Value"}
                </span>
              </div>
              <div className="text-center">
                <p className="text-5xl md:text-6xl font-extrabold text-gradient-primary">
                  {predictedPrice && <AnimatedPrice price={predictedPrice} />}
                </p>
                <p className="mt-3 text-muted-foreground text-sm">
                  Based on {inputs.size.toLocaleString()} sq ft • {inputs.bedrooms} bed • {inputs.floors} floor{inputs.floors > 1 ? 's' : ''} • {inputs.age} years old
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
