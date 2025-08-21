import React, { useState, useEffect } from 'react';
import { validateEmail, validatePassword, validateName, CSRFManager, ClientRateLimit } from '../../utils/security';
import { AlertCircle, CheckCircle } from 'lucide-react';
import Button from './Button';
import Input from './Input';

interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'tel';
  validation: 'email' | 'password' | 'name' | 'none';
  required?: boolean;
  placeholder?: string;
}

interface SecureFormProps {
  fields: FormField[];
  onSubmit: (data: Record<string, string>) => Promise<void>;
  submitText?: string;
  className?: string;
}

const SecureForm: React.FC<SecureFormProps> = ({
  fields,
  onSubmit,
  submitText = 'Submit',
  className = '',
}) => {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Initialize CSRF token on component mount
  useEffect(() => {
    CSRFManager.refreshToken();
  }, []);

  const validateField = (field: FormField, value: string) => {
    if (field.required && !value) {
      return `${field.label} is required`;
    }

    if (!value) return '';

    switch (field.validation) {
      case 'email': {
        const result = validateEmail(value);
        return result.isValid ? '' : result.message || 'Invalid email';
      }
      case 'password': {
        const result = validatePassword(value);
        return result.isValid ? '' : result.message || 'Invalid password';
      }
      case 'name': {
        const result = validateName(value);
        return result.isValid ? '' : result.message || 'Invalid name';
      }
      default:
        return '';
    }
  };

  const handleFieldChange = (fieldName: string, value: string) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    
    // Clear error when user starts typing
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: '' }));
    }
  };

  const handleFieldBlur = (field: FormField) => {
    setTouched(prev => ({ ...prev, [field.name]: true }));
    
    const value = formData[field.name] || '';
    const error = validateField(field, value);
    
    setErrors(prev => ({ ...prev, [field.name]: error }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    fields.forEach(field => {
      const value = formData[field.name] || '';
      const error = validateField(field, value);
      
      if (error) {
        newErrors[field.name] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Rate limiting check
    if (!ClientRateLimit.checkLimit('form-submit', 5, 60000)) {
      setSubmitError('Too many form submissions. Please wait a moment.');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      await onSubmit(formData);
    } catch (error: any) {
      setSubmitError(error.message || 'An error occurred while submitting the form');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFieldIcon = (field: FormField, value: string) => {
    if (!touched[field.name] || !value) return null;
    
    const error = errors[field.name];
    return error ? (
      <AlertCircle className="w-4 h-4 text-red-500" />
    ) : (
      <CheckCircle className="w-4 h-4 text-green-500" />
    );
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      {submitError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600">{submitError}</p>
          </div>
        </div>
      )}

      {fields.map((field) => {
        const value = formData[field.name] || '';
        const error = errors[field.name];
        const hasError = touched[field.name] && !!error;

        return (
          <div key={field.name} className="space-y-1">
            <Input
              label={field.label}
              type={field.type}
              value={value}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              onBlur={() => handleFieldBlur(field)}
              placeholder={field.placeholder}
              required={field.required}
              className={hasError ? 'border-red-300' : ''}
              data-testid={`input-${field.name}`}
            />
            
            <div className="flex items-center justify-between min-h-[20px]">
              {hasError && (
                <p className="text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {error}
                </p>
              )}
              <div className="ml-auto">
                {getFieldIcon(field, value)}
              </div>
            </div>
          </div>
        );
      })}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        loading={isSubmitting}
        disabled={isSubmitting || Object.values(errors).some(error => !!error)}
        className="w-full"
        data-testid="button-submit"
      >
        {isSubmitting ? 'Submitting...' : submitText}
      </Button>
    </form>
  );
};

export default SecureForm;