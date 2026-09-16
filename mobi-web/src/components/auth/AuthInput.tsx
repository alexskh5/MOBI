interface AuthInputProps {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}

function AuthInput({
  id,
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  required = false,
}: AuthInputProps) {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={id}
        className="font-itim text-lg"
      >
        {label}
      </label>

      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className="
          w-full
          rounded-xl
          bg-[#F0E4F1]
          px-4
          py-3
          outline-none
          transition
          focus:ring-2
          focus:ring-[#AAB7DA]
        "
      />
    </div>
  );
}

export default AuthInput;