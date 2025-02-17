
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CommunicationChannelProps {
  selectedChannel: 'f2f' | 'email' | 'social_media';
  setSelectedChannel: (value: 'f2f' | 'email' | 'social_media') => void;
}

export const CommunicationChannel = ({
  selectedChannel,
  setSelectedChannel,
}: CommunicationChannelProps) => {
  return (
    <Select value={selectedChannel} onValueChange={(value: 'f2f' | 'email' | 'social_media') => setSelectedChannel(value)}>
      <SelectTrigger>
        <SelectValue placeholder="Select communication channel" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="f2f">Face to Face</SelectItem>
        <SelectItem value="email">Email</SelectItem>
        <SelectItem value="social_media">Social Media</SelectItem>
      </SelectContent>
    </Select>
  );
};
