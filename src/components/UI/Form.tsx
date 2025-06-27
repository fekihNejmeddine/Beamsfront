import React from "react";
import { Box, CircularProgress, styled } from "@mui/material";
import { FormProvider, UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";

interface FormProps {
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  children: React.ReactNode;
  isSubmitting?: boolean;
  methods?: UseFormReturn<Record<string, any>>;
  ariaLabel?: string;
}

const FormContainer = styled("form")(({ theme }) => ({
  position: "relative",
  marginTop: theme.spacing(3),
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(1.5),
  },
}));

const LoadingOverlay = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: theme.palette.action.disabledBackground,
  opacity: 0.7,
  zIndex: 1,
  borderRadius: theme.shape.borderRadius,
}));

const CustomForm: React.FC<FormProps> = ({
  onSubmit,
  children,
  isSubmitting = false,
  methods,
  ariaLabel,
}) => {
  const { t } = useTranslation();

  const formContent = (
    <FormContainer
      onSubmit={onSubmit}
      noValidate
      aria-label={ariaLabel || t("Form")}
    >
      {isSubmitting && (
        <LoadingOverlay>
          <CircularProgress size={24} />
        </LoadingOverlay>
      )}
      {children}
    </FormContainer>
  );

  return methods ? (
    <FormProvider {...methods}>{formContent}</FormProvider>
  ) : (
    formContent
  );
};

export default CustomForm;
