import React from 'react';

interface SegmentedControlProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}

const SegmentedControl = <T extends string>({ options, value, onChange }: SegmentedControlProps<T>) => {
  return (
    <div className="relative flex w-full p-1 bg-gray-800/70 rounded-lg">
      <div
        className="absolute top-1 bottom-1 bg-blue-600 rounded-md transition-all duration-300 ease-in-out shadow-md"
        style={{
          width: `calc(${100 / options.length}% - 4px)`,
          left: `calc(${options.findIndex(opt => opt.value === value) * (100 / options.length)}% + 2px)`,
        }}
      />
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`relative z-10 w-full py-2 text-sm font-bold transition-colors duration-300 rounded-md focus:outline-none ${
            value === option.value ? 'text-white' : 'text-gray-300 hover:text-white'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

export default SegmentedControl;