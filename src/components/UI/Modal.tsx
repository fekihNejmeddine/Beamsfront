import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Modal,
  Box,
  Typography,
  Fade,
  useTheme,
  useMediaQuery,
  IconButton,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Radio,
  FormHelperText,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import "react-toastify/dist/ReactToastify.css";
import CloseIcon from "@mui/icons-material/Close";
import Input from "./Input";
import CustomButton from "./Button";
import CustomForm from "./Form";
import CustomSelect from "./Select";
import AutocompleteInput from "./AutocompleteInput";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import moment from "moment";
import { SelectChangeEvent } from "@mui/material/Select";
import CustomRadioButton from "./CustomRadioButton";

const ModalContainer = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "50%",
  maxWidth: 600,
  maxHeight: "90vh",
  backgroundColor: theme.palette.background.paper,
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[24],
  outline: "none",
  display: "flex",
  flexDirection: "column",
  overflowY: "auto",
  border: `2px solid ${theme.palette.divider}`,
  transition: "all 0.3s ease",
  "&:hover": {
    boxShadow: `0px 10px 25px ${
      theme.palette.mode === "dark"
        ? "rgba(0, 0, 0, 0.5)"
        : "rgba(0, 0, 0, 0.15)"
    }`,
  },
  [theme.breakpoints.down("sm")]: {
    width: "95%",
  },
}));

const Header = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const FieldsGrid = styled(Box)(({ theme }) => ({
  display: "grid",
  gap: theme.spacing(2),
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    gridTemplateColumns: "1fr 1fr",
  },
}));

const ActionButtons = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(2),
  justifyContent: "flex-end",
  [theme.breakpoints.down("sm")]: {
    flexDirection: "column-reverse",
  },
}));

export interface FieldConfig {
  label: string;
  name: string;
  type?:
    | "text"
    | "number"
    | "password"
    | "email"
    | "tel"
    | "date"
    | "datetime-local";
  value: any;
  required?: boolean;
  icon?: "account" | "lock" | "email" | "phone" | "calendar";
  selectOptions?: { value: string; label: string }[];
  options?: any[];
  getOptionLabel?: (option: any) => string;
  disabled?: boolean;
  inputProps?: {
    min?: any;
    max?: number;
    step?: number;
    format?: string;
    minDateTime?: any;
    minutesStep?: number;
  };
  error?: boolean;
  rules?: any;
  helperText?: string;
  inputType?: "input" | "select" | "autocomplete" | "datetime-picker" | "radio";
  multiline?: boolean;
  rows?: number;
  autoComplete?: string;
  radioOptions?: { value: string; label: string; disabled?: boolean }[];
}

interface EntityModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  entity: Record<string, any> | null;
  fields: FieldConfig[];
  onChange: (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | SelectChangeEvent<string>
      | { target: { name: string; value: any } }
  ) => void;
  onSubmit: (data: Record<string, any>) => void;
  entityType: string;
  isLoading?: boolean;
  children?: React.ReactNode;
}

const EntityModal: React.FC<EntityModalProps> = ({
  open,
  onClose,
  title,
  entity,
  fields,
  onChange,
  onSubmit,
  entityType,
  isLoading = false,
  children,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [isSubmitting, setIsSubmitting] = useState(isLoading);

  const {
    handleSubmit,
    formState: { errors, isValid },
    register,
    reset,
    trigger,
    control,
    getValues,
  } = useForm<Record<string, any>>({
    mode: "onChange",
    defaultValues: entity || {},
    resolver: async (data) => {
      const errors: Record<string, { type: string; message: string }> = {};
      const balance = parseFloat(data.balance);
      const minBalance = parseFloat(data.minBalance);

      if (!isNaN(balance) && !isNaN(minBalance)) {
        if (minBalance > balance) {
          errors.minBalance = {
            type: "maxBalance",
            message: "Le solde minimum ne peut pas dépasser le solde",
          };
        }
        if (balance < minBalance) {
          errors.balance = {
            type: "minBalance",
            message: "Le solde ne peut pas être inférieur au solde minimum",
          };
        }
      }

      return {
        values: data,
        errors,
      };
    },
  });

  useEffect(() => {
    if (open) {
      reset((formValues) => ({
        ...formValues,
        ...(entity || {}),
      }));
    } else {
      reset({});
    }
  }, [open, reset]);

  const handleModalClose = () => {
    reset({});
    setIsSubmitting(false);
    onClose();
  };

  const handleFormSubmit = async (data: Record<string, any>) => {
    const isValid = await trigger();
    if (!isValid) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Modal open={open} onClose={handleModalClose} closeAfterTransition>
        <Fade in={open} timeout={300}>
          <ModalContainer role="dialog" aria-labelledby="modal-title">
            <Header>
              <Typography
                id="modal-title"
                variant={isMobile ? "h6" : "h5"}
                sx={{
                  fontWeight: 700,
                  color: theme.palette.text.primary,
                }}
              >
                {t(title)}
              </Typography>
              <IconButton
                onClick={handleModalClose}
                sx={{
                  color: theme.palette.text.secondary,
                  "&:hover": {
                    backgroundColor: theme.palette.action.hover,
                    color: theme.palette.error.main,
                  },
                }}
                aria-label={t("Close")}
              >
                <CloseIcon fontSize={isMobile ? "small" : "medium"} />
              </IconButton>
            </Header>

            <CustomForm onSubmit={handleSubmit(handleFormSubmit)}>
              <FieldsGrid>
                {fields.map((field) => (
                  <Box
                    key={field.name}
                    sx={{ gridColumn: field.multiline ? "1 / -1" : "auto" }}
                  >
                    {field.inputType === "select" && field.selectOptions ? (
                      <CustomSelect
                        name={field.name}
                        label={t(field.label)}
                        value={entity?.[field.name] || ""}
                        selectOptions={field.selectOptions}
                        onChange={(e) => onChange(e)}
                        control={control}
                        rules={{
                          required: field.required
                            ? `${t(field.label)} ${t("is required")}`
                            : false,
                        }}
                        error={!!errors[field.name]}
                        helperText={
                          errors[field.name]?.message as string | undefined
                        }
                        disabled={field.disabled || isSubmitting}
                      />
                    ) : field.inputType === "autocomplete" ? (
                      <Controller
                        name={field.name}
                        control={control}
                        defaultValue={entity?.[field.name] || []}
                        rules={field.rules}
                        render={({
                          field: { onChange: formOnChange, value },
                          fieldState: { error },
                        }) => (
                          <AutocompleteInput
                            options={field.options || []}
                            value={value || []}
                            onChange={(newValue) => {
                              formOnChange(newValue);
                              onChange({
                                target: {
                                  name: field.name,
                                  value: newValue,
                                },
                              });
                            }}
                            getOptionDisabled={(option) =>
                              (value || []).some(
                                (val: any) =>
                                  (val?.id || val) === (option?.id || option)
                              )
                            }
                            label={t(field.label)}
                            getOptionLabel={field.getOptionLabel}
                            disabled={field.disabled || isSubmitting}
                            error={!!error}
                            helperText={error?.message}
                          />
                        )}
                      />
                    ) : field.inputType === "datetime-picker" ? (
                      <Controller
                        name={field.name}
                        control={control}
                        defaultValue={field.value || null}
                        rules={field.rules}
                        render={({
                          field: { onChange: formOnChange, value },
                          fieldState: { error },
                        }) => (
                          <LocalizationProvider dateAdapter={AdapterMoment}>
                            <DateTimePicker
                              label={t(field.label)}
                              value={value ? moment(value) : null}
                              onChange={(newValue) => {
                                const formattedValue = newValue
                                  ? moment(newValue).format("YYYY-MM-DD HH:mm")
                                  : null;
                                formOnChange(formattedValue);
                                onChange({
                                  target: {
                                    name: field.name,
                                    value: formattedValue,
                                  },
                                });
                              }}
                              timeSteps={{
                                minutes: field.inputProps?.minutesStep || 1,
                              }}
                              views={[
                                "year",
                                "month",
                                "day",
                                "hours",
                                "minutes",
                              ]}
                              disabled={field.disabled || isSubmitting}
                              minDateTime={field.inputProps?.minDateTime}
                              format={
                                field.inputProps?.format || "DD/MM/YYYY HH:mm"
                              }
                              slotProps={{
                                textField: {
                                  error: !!error,
                                  helperText: error?.message,
                                  fullWidth: true,
                                },
                              }}
                            />
                          </LocalizationProvider>
                        )}
                      />
                    ) : field.inputType === "radio" && field.radioOptions ? (
                      <Controller
                        name={field.name}
                        control={control}
                        defaultValue={entity?.[field.name] || ""}
                        rules={{
                          required: field.required
                            ? t("fieldRequired", { field: t(field.label) })
                            : false,
                          ...field.rules,
                        }}
                        render={({
                          field: { onChange: formOnChange, value },
                        }) => (
                          <CustomRadioButton
                            error={!!errors[field.name]}
                            disabled={field.disabled || isSubmitting}
                          >
                            <FormLabel component="legend">
                              {t(field.label)}
                            </FormLabel>
                            <RadioGroup
                              row
                              value={value}
                              onChange={(e) => {
                                formOnChange(e.target.value);
                                onChange({
                                  target: {
                                    name: field.name,
                                    value: e.target.value,
                                  },
                                });
                              }}
                            >
                              {field.radioOptions?.map((option) => (
                                <FormControlLabel
                                  key={option.value}
                                  value={option.value}
                                  control={<Radio />}
                                  label={t(option.label)}
                                  disabled={
                                    option.disabled ||
                                    field.disabled ||
                                    isSubmitting
                                  }
                                />
                              ))}
                            </RadioGroup>
                            {errors[field.name] && (
                              <FormHelperText error>
                                {errors[field.name]?.message as string}
                              </FormHelperText>
                            )}
                          </CustomRadioButton>
                        )}
                      />
                    ) : (
                      <Input
                        name={field.name}
                        label={t(field.label)}
                        type={field.type || "text"}
                        register={register}
                        rules={{
                          required: field.required
                            ? `${t(field.label)} ${t("is required")}`
                            : false,
                          ...field.rules,
                        }}
                        error={!!errors[field.name]}
                        helperText={
                          errors[field.name]?.message as string | undefined
                        }
                        disabled={field.disabled || isSubmitting}
                        inputProps={field.inputProps}
                        //  multiline={field.multiline}
                        // rows={field.rows}
                      />
                    )}
                  </Box>
                ))}
              </FieldsGrid>

              {children}

              <ActionButtons sx={{ mt: 3 }}>
                {t(title) !== t("Meet Details") && (
                  <CustomButton
                    variant="contained"
                    type="submit"
                    isFormValid={isValid}
                    fullWidth={isMobile}
                    // disabled={isSubmitting || !isValid}
                  >
                    {t(title)}
                  </CustomButton>
                )}
                <CustomButton
                  variant="contained"
                  onClick={handleModalClose}
                  fullWidth={isMobile}
                  //    disabled={isSubmitting}
                >
                  {t("Cancel")}
                </CustomButton>
              </ActionButtons>
            </CustomForm>
          </ModalContainer>
        </Fade>
      </Modal>
    </>
  );
};

export { EntityModal };
