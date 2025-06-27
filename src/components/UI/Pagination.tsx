import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import useAuth from "../../hooks/useAuth";
import { actions } from "../../store/user/slice";
import { TablePagination } from "@mui/material";

const YourComponent = () => {
  const dispatch = useDispatch();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [filters, setFilters] = useState({
    page: 0,
    limit: 5,
    searchQuery: "",
    role: "",
  });

  const { auth } = useAuth(); // ou ton hook pour récupérer l'utilisateur
  const selectedRole = filters.role; // ajuste selon ton code
  const total = 100; // ou ta valeur dynamique
  const t = (text: string) => text; // si tu n'as pas encore branché i18n

  // --- ⚡ useEffect qui surveille filters et déclenche fetch automatiquement ---
  useEffect(() => {
    if (auth.accessToken) {
      dispatch(
        actions.fetchUsersRequest({
          page: filters.page + 1, // ici, tu envoies `page+1` si backend commence à 1
          limit: filters.limit,
          search: filters.searchQuery,
          role: selectedRole,
          pageSize: filters.limit,
          authToken: auth.accessToken,
        })
      );
    }
  }, [filters, dispatch, auth.accessToken, selectedRole]);

  return (
    <TablePagination
      rowsPerPageOptions={[5, 10, 25]}
      count={total}
      rowsPerPage={rowsPerPage}
      page={page}
      onPageChange={(_event, newPage) => {
        console.log("Navigating to page:", newPage);
        setPage(newPage);
        setFilters((prev) => ({ ...prev, page: newPage }));
      }}
      onRowsPerPageChange={(event) => {
        const newRowsPerPage = parseInt(event.target.value, 10);
        setRowsPerPage(newRowsPerPage);
        setPage(0);
        setFilters((prev) => ({ ...prev, page: 0, limit: newRowsPerPage }));
      }}
      labelRowsPerPage={t("Rows per page:")}
      labelDisplayedRows={({ from, to, count }) =>
        t(`${from}-${to} of ${count}`)
      }
    />
  );
};
