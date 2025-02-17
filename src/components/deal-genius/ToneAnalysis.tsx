
import { Slider } from "@/components/ui/slider";

interface ToneAnalysisProps {
  formality: number;
  setFormality: (value: number) => void;
  persuasiveness: number;
  setPersuasiveness: (value: number) => void;
  urgency: number;
  setUrgency: (value: number) => void;
}

export const ToneAnalysis = ({
  formality,
  setFormality,
  persuasiveness,
  setPersuasiveness,
  urgency,
  setUrgency,
}: ToneAnalysisProps) => {
  return (
    <div className="md:col-span-2">
      <h3 className="text-lg font-medium mb-4">Tone Analysis</h3>
      <div className="space-y-6">
        <div>
          <label className="text-sm font-medium">Formality</label>
          <Slider
            value={[formality]}
            onValueChange={(value) => setFormality(value[0])}
            max={100}
            step={1}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Persuasiveness</label>
          <Slider
            value={[persuasiveness]}
            onValueChange={(value) => setPersuasiveness(value[0])}
            max={100}
            step={1}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Urgency</label>
          <Slider
            value={[urgency]}
            onValueChange={(value) => setUrgency(value[0])}
            max={100}
            step={1}
          />
        </div>
      </div>
    </div>
  );
};
