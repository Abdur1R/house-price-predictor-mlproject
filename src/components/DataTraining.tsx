import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Database, CheckCircle, AlertCircle } from "lucide-react";
import { parseCSVData, trainModel, TrainedModel } from "@/lib/ml";

interface DataTrainingProps {
  onModelTrained: (model: TrainedModel) => void;
}

const SAMPLE_DATA = `size,bedrooms,floors,age,price
2104,5,1,45,460000
1416,3,2,40,232000
852,2,1,35,178000
1534,3,2,13,315000
1427,3,1,18,270000
1380,3,1,5,315000
1494,3,1,11,292000
1940,4,2,33,340000
2000,3,1,5,380000
1890,3,2,14,330000`;

export default function DataTraining({ onModelTrained }: DataTrainingProps) {
  const [csvData, setCsvData] = useState("");
  const [status, setStatus] = useState<"idle" | "training" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [coefficients, setCoefficients] = useState<{ weights: number[]; bias: number } | null>(null);

  const handleTrain = () => {
    const parsed = parseCSVData(csvData);
    
    if (!parsed || parsed.X.length < 3) {
      setStatus("error");
      setMessage("Need at least 3 valid data rows with 5 columns: size, bedrooms, floors, age, price");
      return;
    }

    setStatus("training");
    setMessage(`Training on ${parsed.X.length} samples...`);

    // Use setTimeout to allow UI to update
    setTimeout(() => {
      try {
        const model = trainModel(parsed.X, parsed.y);
        const coefs = model.regressor.getCoefficients();
        
        setCoefficients(coefs);
        setStatus("success");
        setMessage(`Model trained successfully! ${parsed.X.length} samples used.`);
        onModelTrained(model);
      } catch (err) {
        setStatus("error");
        setMessage("Training failed. Check your data format.");
      }
    }, 100);
  };

  const loadSampleData = () => {
    setCsvData(SAMPLE_DATA);
    setStatus("idle");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCsvData(event.target?.result as string);
        setStatus("idle");
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="bg-card rounded-2xl p-6 shadow-card border border-border/50">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
          <Database className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Training Data</h3>
          <p className="text-sm text-muted-foreground">CSV format: size, bedrooms, floors, age, price</p>
        </div>
      </div>

      <Textarea
        value={csvData}
        onChange={(e) => setCsvData(e.target.value)}
        placeholder="Paste your CSV data here or upload a file..."
        className="min-h-[150px] font-mono text-sm mb-4"
      />

      <div className="flex flex-wrap gap-3 mb-4">
        <Button variant="outline" size="sm" onClick={loadSampleData}>
          <Database className="w-4 h-4 mr-2" />
          Load Sample Data
        </Button>
        
        <label>
          <input
            type="file"
            accept=".csv,.txt"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button variant="outline" size="sm" asChild>
            <span className="cursor-pointer">
              <Upload className="w-4 h-4 mr-2" />
              Upload CSV
            </span>
          </Button>
        </label>

        <Button 
          variant="hero" 
          size="sm" 
          onClick={handleTrain}
          disabled={!csvData.trim() || status === "training"}
        >
          {status === "training" ? "Training..." : "Train Model"}
        </Button>
      </div>

      {status !== "idle" && (
        <div className={`flex items-start gap-2 p-3 rounded-lg ${
          status === "success" ? "bg-green-500/10 text-green-600" :
          status === "error" ? "bg-destructive/10 text-destructive" :
          "bg-primary/10 text-primary"
        }`}>
          {status === "success" ? <CheckCircle className="w-5 h-5 mt-0.5" /> :
           status === "error" ? <AlertCircle className="w-5 h-5 mt-0.5" /> :
           <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />}
          <div>
            <p className="text-sm font-medium">{message}</p>
            {coefficients && status === "success" && (
              <p className="text-xs mt-1 opacity-80">
                Coefficients: [{coefficients.weights.map(w => w.toFixed(0)).join(", ")}], 
                Bias: {coefficients.bias.toFixed(0)}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
