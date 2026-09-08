import { Popover, PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";
import dayjs from "dayjs";
import { CalendarIcon } from "lucide-react";
import { DayPicker, Matcher } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { FieldError, FieldValues, UseFormRegister, UseFormSetValue, UseFormRegisterReturn, RegisterOptions } from "react-hook-form";

interface DateProps {
  value: Date | null | undefined;
  name: string;
  placeholder?: string;
  errors?: FieldError | undefined;
  setValue: UseFormSetValue<any>;
  register?: UseFormRegister<any>;
  validation?: RegisterOptions;
  className?: string;
  disabled?: Matcher | Matcher[] | undefined;
  fromYear?: number;
  toYear?: number;
}

export const Date = ({
  value,
  name,
  placeholder,
  errors,
  setValue,
  register,
  validation,
  className = "",
  disabled,
  fromYear,
  toYear
}: DateProps) => {
  // Register the field if register function is provided
  const registerProps = register ? register(name, validation) : {};

  return (
    <div className="w-full">
      <Popover>
        <PopoverTrigger asChild>
          <div
            className={`h-10 flex items-center gap-2 px-3 text-slate-600 rounded-md placeholder:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors ? "ring-red-500" : "ring-slate-300"
            } ring-1 ${className}`}
            {...registerProps}
          >
            <CalendarIcon className="text-gray-400" />
            {value ? dayjs(value).format("DD/MM/YYYY") : <span className="text-[#9A9A9A]">{placeholder}</span>}
          </div>
        </PopoverTrigger>
        <PopoverContent align="start" side="bottom" className="bg-white rounded-lg shadow-lg p-3 z-50">
          <DayPicker
            captionLayout="dropdown"
            mode="single"
            selected={value ?? undefined}
            onSelect={(val) => {
              setValue(name, val?.toISOString() ?? "", {
                shouldValidate: true,
              });
            }}
            weekStartsOn={1}
            disabled={disabled}
              fromYear={fromYear}
  toYear={toYear}
          />
        </PopoverContent>
      </Popover>
      {errors && <span className="text-red-500 text-sm block mt-1">{errors?.message}</span>}
    </div>
  );
};
