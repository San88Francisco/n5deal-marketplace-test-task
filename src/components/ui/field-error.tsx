export function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;

  return <p className="field-error">{errors[0]}</p>;
}
