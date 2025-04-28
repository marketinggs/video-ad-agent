
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AIModel } from "@/data/demoData";

interface ModelSelectorProps {
  models: AIModel[];
  onSelectModel: (modelId: string) => void;
}

const ModelSelector = ({ models, onSelectModel }: ModelSelectorProps) => {
  return (
    <div className="space-y-2 w-full">
      <label className="text-sm font-medium">Select AI Model</label>
      <Select onValueChange={onSelectModel}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Choose an AI model" />
        </SelectTrigger>
        <SelectContent>
          {models.map((model) => (
            <SelectItem key={model.id} value={model.id}>
              {model.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ModelSelector;
