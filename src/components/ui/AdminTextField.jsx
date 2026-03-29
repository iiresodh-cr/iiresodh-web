import { TextField } from '@mui/material';

export default function AdminTextField({ 
  label, 
  value, 
  onChange, 
  required = false, 
  type = "text", 
  placeholder, 
  multiline = false, 
  rows, 
  InputLabelProps, 
  inputProps, 
  step 
}) {
  return (
    <TextField
      label={label}
      value={value}
      onChange={onChange}
      required={required}
      type={type}
      placeholder={placeholder}
      multiline={multiline}
      rows={rows}
      fullWidth
      variant="outlined"
      size="medium"
      InputLabelProps={InputLabelProps}
      inputProps={{ step, ...inputProps }}
      sx={{
        backgroundColor: '#F9FAFB', // Equivalente a bg-gray-50 de Tailwind
        '& .MuiOutlinedInput-root': {
          borderRadius: '12px', // Coincide con rounded-xl
          '& fieldset': {
            borderColor: '#E5E7EB', // Equivalente a border-gray-200
          },
          '&:hover fieldset': {
            borderColor: '#457B9D', // Hover state
          },
        },
      }}
    />
  );
}