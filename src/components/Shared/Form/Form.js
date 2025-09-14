import React, { useState, useEffect } from "react";
import "./Form.css";

const Form = ({
  fields = [],
  initialValues = {},
  onSubmit,
  onCancel,
  loading = false,
  submitText = "Enregistrer",
  cancelText = "Annuler",
  showCancel = true,
  validationSchema = {},
  className = "",
  children,
}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Update values when initialValues change
  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  // Validation function
  const validateField = (name, value) => {
    const fieldSchema = validationSchema[name];
    if (!fieldSchema) return "";

    // Required validation
    if (fieldSchema.required && (!value || value.toString().trim() === "")) {
      return fieldSchema.requiredMessage || "Ce champ est obligatoire";
    }

    // Min length validation
    if (
      fieldSchema.minLength &&
      value &&
      value.toString().length < fieldSchema.minLength
    ) {
      return (
        fieldSchema.minLengthMessage ||
        `Minimum ${fieldSchema.minLength} caractères`
      );
    }

    // Max length validation
    if (
      fieldSchema.maxLength &&
      value &&
      value.toString().length > fieldSchema.maxLength
    ) {
      return (
        fieldSchema.maxLengthMessage ||
        `Maximum ${fieldSchema.maxLength} caractères`
      );
    }

    // Email validation
    if (fieldSchema.email && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return fieldSchema.emailMessage || "Format email invalide";
      }
    }

    // Pattern validation
    if (fieldSchema.pattern && value) {
      const regex = new RegExp(fieldSchema.pattern);
      if (!regex.test(value)) {
        return fieldSchema.patternMessage || "Format invalide";
      }
    }

    // Custom validation function
    if (fieldSchema.validate && value) {
      const customError = fieldSchema.validate(value, values);
      if (customError) return customError;
    }

    return "";
  };

  // Handle input change
  const handleChange = (name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Handle input blur
  const handleBlur = (name) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, values[name]);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  // Validate all fields
  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    fields.forEach((field) => {
      const error = validateField(field.name, values[field.name]);
      if (error) {
        newErrors[field.name] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    setTouched(
      fields.reduce((acc, field) => ({ ...acc, [field.name]: true }), {})
    );

    return isValid;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit(values);
    }
  };

  // Render field based on type
  const renderField = (field) => {
    const {
      name,
      label,
      type = "text",
      placeholder,
      options = [],
      rows = 3,
      required = false,
      disabled = false,
      step,
      min,
      max,
      accept,
    } = field;

    const fieldValue = values[name] || "";
    const fieldError = touched[name] && errors[name];
    const fieldId = `field-${name}`;

    const commonProps = {
      id: fieldId,
      name,
      disabled: disabled || loading,
      onBlur: () => handleBlur(name),
      className: `form-control ${fieldError ? "is-invalid" : ""}`,
    };

    let fieldElement;

    switch (type) {
      case "select":
        fieldElement = (
          <select
            {...commonProps}
            value={fieldValue}
            onChange={(e) => handleChange(name, e.target.value)}
          >
            <option value="">{placeholder || "Sélectionner..."}</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
        break;

      case "textarea":
        fieldElement = (
          <textarea
            {...commonProps}
            rows={rows}
            placeholder={placeholder}
            value={fieldValue}
            onChange={(e) => handleChange(name, e.target.value)}
          />
        );
        break;

      case "checkbox":
        fieldElement = (
          <div className="form-check">
            <input
              type="checkbox"
              id={fieldId}
              name={name}
              className="form-check-input"
              checked={!!fieldValue}
              disabled={disabled || loading}
              onChange={(e) => handleChange(name, e.target.checked)}
            />
            <label htmlFor={fieldId} className="form-check-label">
              {label}
              {required && <span className="required-asterisk">*</span>}
            </label>
          </div>
        );
        break;

      case "radio":
        fieldElement = (
          <div className="form-radio-group">
            {options.map((option) => (
              <div key={option.value} className="form-check form-check-inline">
                <input
                  type="radio"
                  id={`${fieldId}-${option.value}`}
                  name={name}
                  value={option.value}
                  className="form-check-input"
                  checked={fieldValue === option.value}
                  disabled={disabled || loading}
                  onChange={(e) => handleChange(name, e.target.value)}
                />
                <label
                  htmlFor={`${fieldId}-${option.value}`}
                  className="form-check-label"
                >
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        );
        break;

      case "file":
        fieldElement = (
          <input
            type="file"
            {...commonProps}
            accept={accept}
            onChange={(e) => handleChange(name, e.target.files[0])}
          />
        );
        break;

      case "number":
        fieldElement = (
          <input
            type="number"
            {...commonProps}
            placeholder={placeholder}
            value={fieldValue}
            step={step}
            min={min}
            max={max}
            onChange={(e) => handleChange(name, e.target.value)}
          />
        );
        break;

      case "date":
      case "datetime-local":
      case "time":
        fieldElement = (
          <input
            type={type}
            {...commonProps}
            value={fieldValue}
            onChange={(e) => handleChange(name, e.target.value)}
          />
        );
        break;

      default:
        fieldElement = (
          <input
            type={type}
            {...commonProps}
            placeholder={placeholder}
            value={fieldValue}
            onChange={(e) => handleChange(name, e.target.value)}
          />
        );
    }

    if (type === "checkbox") {
      return (
        <div key={name} className="form-group form-group-checkbox">
          {fieldElement}
          {fieldError && <div className="invalid-feedback">{fieldError}</div>}
        </div>
      );
    }

    return (
      <div key={name} className="form-group">
        {type !== "hidden" && (
          <label htmlFor={fieldId} className="form-label">
            {label}
            {required && <span className="required-asterisk">*</span>}
          </label>
        )}
        {fieldElement}
        {fieldError && <div className="invalid-feedback">{fieldError}</div>}
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className={`gsc-form ${className}`}>
      {fields.map(renderField)}

      {children}

      <div className="form-actions">
        {showCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="btn btn-secondary"
          >
            {cancelText}
          </button>
        )}
        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? (
            <>
              <span className="spinner"></span>
              Enregistrement...
            </>
          ) : (
            submitText
          )}
        </button>
      </div>
    </form>
  );
};

export default Form;
