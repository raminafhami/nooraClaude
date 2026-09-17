import { Input } from "@/form/Input";

interface Props {
  searchTerm: string;
  onSearch: (searchTerm: string) => void;
}

export default function JobSearch({ searchTerm, onSearch }: Props) {
  return (
    <div className="ms-auto">
      <Input
        className="w-48"
        placeholder="جستجو ..."
        value={searchTerm}
        onChange={(e) => onSearch(e.target.value)}
      />
    </div>
  );
}
