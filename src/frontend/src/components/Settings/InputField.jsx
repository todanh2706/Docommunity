import React from 'react';

const InputField = ({ label, name, value, onChange, type = "text", disabled, icon: Icon }) => {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">{label}</label>
            <div className={`relative group transition-all duration-200 ${!disabled ? 'opacity-100' : 'opacity-70'}`}>
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors">
                    {Icon && <Icon size={18} />}
                </div>
                <input
                    name={name}
                    type={type}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    className={`w-full bg-[#0F1623] border 
                        ${disabled ? 'border-gray-700 text-gray-400 cursor-not-allowed' : 'border-gray-600 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500'} 
                        rounded-lg py-2.5 pl-10 pr-4 outline-none transition-all placeholder:text-gray-600`}
                />
            </div>
        </div>
    );
};

export default InputField;
