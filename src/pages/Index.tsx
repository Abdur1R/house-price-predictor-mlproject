import { useState } from "react";
import PricePredictor from "@/components/PricePredictor";
import DataTraining from "@/components/DataTraining";
import { Home, TrendingUp, Shield, Zap } from "lucide-react";
import { TrainedModel } from "@/lib/ml";

const FeatureCard = ({ icon: Icon, title, description }: { 
  icon: React.ElementType; 
  title: string; 
  description: string;
}) => (
  <div className="flex items-start gap-4 p-5 rounded-xl bg-card/50 backdrop-blur-sm border border-border/30 hover:border-accent/30 transition-all duration-300">
    <div className="p-2.5 rounded-lg bg-gradient-accent/10 text-accent shrink-0">
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <h3 className="font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  </div>
);

const Index = () => {
  const [trainedModel, setTrainedModel] = useState<TrainedModel | null>(null);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-gradient-primary">
              <Home className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">PriceML</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">How it works</a>
            <a href="#" className="hover:text-foreground transition-colors">About</a>
            <a href="#" className="hover:text-foreground transition-colors">Contact</a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--accent)/0.08),transparent_50%)]" />
        <div className="container mx-auto px-4 pt-16 pb-12 md:pt-24 md:pb-16 relative">
          <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-6 animate-fade-in-up">
              <Zap className="w-4 h-4" />
              Powered by Machine Learning
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground mb-6 leading-tight animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              Instant Property
              <span className="text-gradient-accent"> Value Estimation</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              Get accurate home valuations in seconds using our advanced SGD regression model trained on real market data.
            </p>
          </div>
        </div>
      </section>

      {/* Training Section */}
      <section className="container mx-auto px-4 pb-8">
        <div className="max-w-4xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.25s' }}>
          <DataTraining onModelTrained={setTrainedModel} />
        </div>
      </section>

      {/* Predictor Section */}
      <section className="container mx-auto px-4 pb-16 md:pb-24">
        <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <PricePredictor trainedModel={trainedModel} />
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-muted/30 border-t border-border/50">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Why Choose Our Estimator?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Built on proven machine learning techniques for reliable property valuations
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto">
            <FeatureCard
              icon={TrendingUp}
              title="ML-Powered Accuracy"
              description="Trained using Stochastic Gradient Descent on real housing market data"
            />
            <FeatureCard
              icon={Zap}
              title="Instant Results"
              description="Get valuations in milliseconds with our optimized prediction engine"
            />
            <FeatureCard
              icon={Shield}
              title="Normalized Features"
              description="StandardScaler ensures consistent and reliable predictions every time"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-gradient-primary">
                <Home className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground">PriceML</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Built with scikit-learn SGDRegressor methodology
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
