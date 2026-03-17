export interface FormField {
  label: string;
  value: string;
}

export interface DocumentDef {
  id: string;
  title: string;
  subtitle: string;
  icon: 'form' | 'ai';
  fields: FormField[];
}
