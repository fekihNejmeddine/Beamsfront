import React from "react";
import { IconButton } from "@mui/material";
import { Delete } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import Swal from "sweetalert2";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../store/store";

interface DeleteProps<T> {
  entity: T & { isDeleted?: boolean };
  authToken: string;
  deleteAction: (payload: { [key: string]: T | string }) => any;
  entityName: string;
  payloadKey?: string;
}

const CustomDelete = <T,>({
  entity,
  authToken,
  deleteAction,
  entityName,
  payloadKey = "entity",
}: DeleteProps<T>) => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();

  const confirmDelete = () => {
    Swal.fire({
      title: t("Are you sure ?"),
      text: `${t("Do you really want to delete")} ${entityName}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: t("Yes, delete"),
      cancelButtonText: t("Cancel"),
    }).then((result) => {
      if (result.isConfirmed) {
        console.log(entity);
        console.log(payloadKey);
        const entityWithDeleted = { ...entity, isDeleted: true };
        dispatch(deleteAction({ [payloadKey]: entityWithDeleted, authToken }));
      }
    });
  };

  return (
    <IconButton color="error" onClick={confirmDelete}>
      <Delete />
    </IconButton>
  );
};

export default CustomDelete;
