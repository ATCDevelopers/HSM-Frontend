import {patientAPI} from "../services/patientAPI";

export interface Field {
    key: string;
    label: string;
    type: "text" | "email" | "tel" | "date" | "select" | "textarea" | "number";
    required?: boolean;
    options?: string[];
}

export interface ResourceSchema {
    name: string;
    api: any;
    fields: Field[];
    listColumns: string[];
}

export const resourceSchemas: Record<string, ResourceSchema> = {
    patients: {
        name: "Patient",
        api: patientAPI,
        fields: [
            { key: "firstName", label: "First Name", type: "text", required: true },
            { key: "lastName", label: "Last Name", type: "text", required: true },
            { key: "email", label: "Email", type: "email", required: true },
            { key: "phoneNumber", label: "Phone Number", type: "tel" },
            { key: "dateOfBirth", label: "Date of Birth", type: "date" },
            { 
                key: "gender", 
                label: "Gender", 
                type: "select",
                options: ["Male", "Female", "Other"]
            },
            { key: "address", label: "Address", type: "textarea" },
        ],
        listColumns: ["firstName", "lastName", "email", "phoneNumber"],
    },
};

export default resourceSchemas;
