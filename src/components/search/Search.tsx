import { useRouter } from "next/navigation";
import React, { useState, useEffect, ChangeEvent } from "react";
import { IoMdClose } from "react-icons/io";
import { IoIosSearch } from "react-icons/io";

export default function Search() {
    const [searchInput, setSearchInput] = useState<string>("");
    const [isClearSearchInput, setIsClearSearchInput] =
        useState<boolean>(false);
    const router = useRouter();

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSearchInput(e.target.value);
    };

    const handleClearSearchInput = () => {
        setSearchInput("");
    };

    useEffect(() => {
        setIsClearSearchInput(searchInput.length > 0);
    }, [searchInput]);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        router.push(`/search/${searchInput}`);
        setSearchInput("");
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="hidden md:flex items-stretch relative"
        >
            <input
                onChange={handleChange}
                value={searchInput}
                type="text"
                name="search"
                placeholder="Search..."
                required
                className="py-1 border px-8 rounded bg-third outline-none w-36 lg:w-56"
            />
            <button
                type="submit"
                className="absolute top-0 bottom-0 flex items-center rounded-br rounded-tr justify-center text-secondary px-2 hover:text-black"
            >
                <IoIosSearch />
            </button>
            {isClearSearchInput && (
                <span
                    onClick={handleClearSearchInput}
                    className="absolute top-0 bottom-0 right-0 flex items-center justify-center text-secondary px-2 hover:text-black"
                >
                    <IoMdClose />
                </span>
            )}
        </form>
    );
}
