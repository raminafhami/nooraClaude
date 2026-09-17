import { ChangeEvent } from "react";
import { Tooltip } from "react-tooltip";

interface SearchInputProps {
    placeholder: string;
    value: string | undefined;
    onChange: (search: string) => (void);
    type?: string;
}

export default function SearchInput({
    placeholder,
    value,
    onChange,
    type,
}: SearchInputProps) {

    function handleSearch(event: ChangeEvent<HTMLInputElement>) {
        onChange(event.target.value)
    }

    return (
        <>
            <input
                key={`input[${placeholder}]`}  
                data-tooltip-id={`input[${placeholder}]`}
                className="bg-transparent outline-0 placeholder-black focus:text-blue-500 focus:placeholder-blue-500"
                placeholder={'🔎︎ ' + placeholder}
                onChange={(event) => handleSearch(event)}
                value={value}
                type={type ? type : ""}
            />
            <Tooltip id={`input[${placeholder}]`}>
                جستجو در {placeholder}
            </Tooltip>
        </>
    )
}