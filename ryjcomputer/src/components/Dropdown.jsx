import React, { useState } from "react";

export default function Dropdown({
  label,
  items,
  onSelect,
  itemClassName = "",
  labelClassName = "",
}) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className={`px-4 py-3 hover:bg-[#4400ffff] hover:text-white transition font-medium
                    text-base md:text-lg ${labelClassName}`}
      >
        {label}
      </button>

      {open && (
        <div className="absolute left-0 top-full bg-white shadow-xl rounded-b-xl border border-zinc-100 min-w-[230px] z-50">
          {items.map((it) => (
            <div
              key={it}
              className={`px-4 py-2 cursor-pointer text-sm text-black hover:bg-[#4400ffff] hover:text-white transition-colors ${itemClassName}`}
              onClick={() => onSelect(it)}
            >
              {it}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
