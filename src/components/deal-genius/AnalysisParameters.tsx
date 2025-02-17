
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Insight } from "@/types/types";

interface AnalysisParametersProps {
  salesApproach: Insight['sales_approach'];
  setSalesApproach: (value: Insight['sales_approach']) => void;
  industry: string;
  setIndustry: (value: string) => void;
  purposeNotes: string;
  setPurposeNotes: (value: string) => void;
}

export const AnalysisParameters = ({
  salesApproach,
  setSalesApproach,
  industry,
  setIndustry,
  purposeNotes,
  setPurposeNotes,
}: AnalysisParametersProps) => {
  return (
    <>
      <div>
        <Select value={salesApproach} onValueChange={(value: Insight['sales_approach']) => setSalesApproach(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select sales approach" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="consultative_selling">Consultative Selling</SelectItem>
            <SelectItem value="solution_selling">Solution Selling</SelectItem>
            <SelectItem value="transactional_selling">Transactional Selling</SelectItem>
            <SelectItem value="value_based_selling">Value-based Selling</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Input
          placeholder="Industry"
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          className="w-full"
        />
      </div>

      <div>
        <Textarea
          placeholder="Purpose and Notes"
          value={purposeNotes}
          onChange={(e) => setPurposeNotes(e.target.value)}
          className="w-full"
        />
      </div>
    </>
  );
};
