import React from "react";

export interface FieldSetProps extends React.FieldsetHTMLAttributes<HTMLFieldSetElement> {
    legend?: string;
    children?: React.ReactNode;
    className?: string;
}

function FieldSet({legend, children, className = "", ...props}: FieldSetProps) {
    return (
        <fieldset
            className={`w-full min-w-0 border border-gray-200 rounded-xl p-3.5 sm:p-6 bg-white/50 ${className}`} {...props}>
            {legend && (
                <legend className="text-base sm:text-lg font-semibold text-gray-900 px-2">
                    {legend}
                </legend>
            )}

            <div className="space-y-4 w-full min-w-0">{children}</div>
        </fieldset>
    );
}

export default FieldSet;
