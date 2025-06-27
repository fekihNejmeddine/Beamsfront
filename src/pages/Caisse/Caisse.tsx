import React, { useEffect, useState, ChangeEvent, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { actions, caissesSelectors } from "../../store/fees/caisseSlice";
import { RootState, AppDispatch } from "../../store/store";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import HistoryIcon from "@mui/icons-material/History";
import {
  Button,
  Typography,
  Container,

  Modal,
  Box,
  TextField,
  Paper,
  Card,
  CardContent,
  Grid,
  Avatar,
  LinearProgress,
  Alert,
  AlertTitle,
  Divider,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
} from "@mui/material";
import Table from "../../components/UI/Table";

import useAuth from "../../hooks/useAuth";
import { usersSelectors } from "../../store/user/slice";
import { format, getYear, getMonth } from "date-fns";
import { fr } from "date-fns/locale";
import CloseIcon from "@mui/icons-material/Close";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import { toast } from "react-toastify";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Caisse as CaisseType,
  Participant,
  Transaction,
} from "../../store/fees/Types";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { useTranslation } from "react-i18next";


const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: { xs: "90%", sm: 500 },
  bgcolor: "background.paper",
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
  maxHeight: "90vh",
  overflowY: "auto",
};

// Update ITransaction to enforce Photo as string[]
interface ITransaction {
  id?: number;
  amount: number;
  caisseId: number;
  userId?: number;
  description?: string;
  Photo?: string[];
  createdAt?: string;
  updatedAt?: string;
}

interface TransactionFormData {
  amount: string;
  description: string;
  Photo: (string | File)[];
}

// Helper function to clean Photo URL (remove escaped quotes)
const cleanPhotoUrl = (photo: string): string => {
  return photo.replace(/^"|"$/g, "").replace(/\\"/g, "");
};

// Helper function to normalize Photo to string[]
const normalizePhoto = (photo: string | string[] | undefined): string[] => {
  if (!photo) return [];
  if (typeof photo === "string") {
    try {
      // Handle JSON string or single URL
      const parsed = photo.startsWith("[")
        ? JSON.parse(photo)
        : [cleanPhotoUrl(photo)];
      return Array.isArray(parsed)
        ? parsed.map(cleanPhotoUrl)
        : [cleanPhotoUrl(parsed)];
    } catch (e) {
      console.error("Failed to parse Photo:", photo, e);
      return [cleanPhotoUrl(photo)];
    }
  }
  return photo.map(cleanPhotoUrl);
};

const Caisse = () => {
  const { t } = useTranslation();

  useEffect(() => {
    document.title = "Beams Caisse";
    const showToast = localStorage.getItem("showWelcomeToast");
    if (showToast === "true") {
      toast.success("Welcome to Beams", { autoClose: 3000 });
      localStorage.removeItem("showWelcomeToast");
    }
  }, []);

  const { auth } = useAuth();
  const dispatch = useDispatch<AppDispatch>();
  const {
    transactions,
    loading,
    error,
    createSuccessTransaction,
    updateSuccessTransaction,
    deleteSuccessTransaction,
  } = useSelector((state: RootState) => state.fees);
  const users = useSelector(usersSelectors.selectEntities);
  const caisses = useSelector(caissesSelectors.selectEntities);

  const [openTransactionModal, setOpenTransactionModal] = useState(false);
  const [openActionModal, setOpenActionModal] = useState(false);
  const [selectedCaisseId, setSelectedCaisseId] = useState<number | null>(null);
  const [selectedTransaction, setSelectedTransaction] =
    useState<ITransaction | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [openTransactionConfirmDialog, setOpenTransactionConfirmDialog] =
    useState(false);
  const [pendingTransaction, setPendingTransaction] =
    useState<TransactionFormData | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string[]>([]);
  const [amountError, setAmountError] = useState<string | null>(null);
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [monthFilter, setMonthFilter] = useState<string>("all");
  const [userFilter, setUserFilter] = useState<boolean>(false);
  const [Tpage, TsetPage] = useState(0);
  const [TrowsPerPage, TsetRowsPerPage] = useState(5);

  const selectedCaisse =
    selectedCaisseId !== null ? caisses[selectedCaisseId] : null;
  const currentBalance = selectedCaisse?.balance ?? 0;
  const minBalance = selectedCaisse?.minBalance ?? 0;
  const [filters] = useState<{
    Tpage: number;
    Tlimit: number;
    TsearchQuery: string;
    annee?: number;
    mois?: number;
  }>({
    Tpage: 0,
    Tlimit: 5,
    TsearchQuery: "",
  });

  const transactionFormik = useFormik<TransactionFormData>({
    initialValues: {
      amount: "",
      description: "",
      Photo: [],
    },
    validationSchema: Yup.object({
      amount: Yup.string()
        .matches(/^\d*\.?\d*$/, t("Please enter a valid number"))
        .required(t("The amount is required"))
        .test("is-positive", t("The amount must be positive."), (value) =>
          value ? parseFloat(value) > 0 : false
        ),
      description: Yup.string().required(t("Description is required")),
      Photo: Yup.array()
        .min(1, t("Or Mons An Foto Is Dance"))
        .required(t("Les photos sont requises")),
    }),
    enableReinitialize: true,
    onSubmit: async (values) => {
      if (!auth?.accessToken || selectedCaisseId === null || !auth?.user?.id) {
        toast.error("Erreur : informations d'authentification manquantes");
        return;
      }

      const amount = parseFloat(values.amount);
      if (amount >= minBalance) {
        setAmountError("Le montant ne peut pas dépasser le solde actuel");
        return;
      }

      setPendingTransaction(values);
      setOpenTransactionConfirmDialog(true);
    },
  });

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      const newPreviews = newFiles.map((file) => URL.createObjectURL(file));

      const updatedFiles = [...transactionFormik.values.Photo, ...newFiles];
      const updatedPreviews = [...photoPreview, ...newPreviews];

      setPhotoPreview(updatedPreviews);
      transactionFormik.setFieldValue("Photo", updatedFiles);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    transactionFormik.handleChange(e);

    if (value) {
      const amount = parseFloat(value);
      
      if (currentBalance - amount <= minBalance) {
        setAmountError(t("The amount cannot exceed the current minbalance"));
      } else {
        setAmountError(null);
      }
    } else {
      setAmountError(null);
    }
  };

  const confirmTransaction = async () => {
    if (!pendingTransaction || !auth?.accessToken || selectedCaisseId === null)
      return;

    setIsProcessing(true);
    try {
      const transactionAmount = parseFloat(pendingTransaction.amount);
      const selectedCaisse =
        selectedCaisseId !== null ? caisses[selectedCaisseId] : null;
      if (!selectedCaisse) {
        toast.error(t("Cash register not found"));
        return;
      }

      if (transactionAmount <= 0) {
        toast.error(t("The amount must be positive"));
        return;
      }

      let updatedBalance: number;
      updatedBalance = selectedCaisse.balance - transactionAmount;

      if (updatedBalance <= 0) {
        toast.error(t("Insufficient balance for this withdrawal"));
        return;
      }

      const photoUrls: string[] = [];
      for (const photo of pendingTransaction.Photo) {
        if (photo instanceof File) {
          const photoUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(photo);
          });
          photoUrls.push(photoUrl);
        } else {
          photoUrls.push(cleanPhotoUrl(photo));
        }
      }

      await dispatch(
        actions.createTransactionRequest({
          transaction: {
            amount: transactionAmount,
            caisseId: selectedCaisseId,
            userId: auth.user.id,
            description: pendingTransaction.description,
            Photo: photoUrls,
          },
          token: auth.accessToken,
        })
      );

      const CreateCaisse: CaisseType = {
        id: selectedCaisseId,
        balance: updatedBalance,
      };
      await dispatch(
        actions.updateCaisseRequest({
          caisse: CreateCaisse,
          token: auth.accessToken,
        })
      );

      transactionFormik.resetForm();
      setPhotoPreview([]);
      setOpenTransactionConfirmDialog(false);
      handleCloseTransactionModal();
      toast.success(t("Withdrawal completed successfully"));
    } catch (err: any) {
      toast.error(err.message || t("Error handling transaction"));
      console.error(err);
    } finally {
      setIsProcessing(false);
      setPendingTransaction(null);
    }
  };

  useEffect(() => {
    return () => {
      photoPreview.forEach((preview) => {
        if (preview.startsWith("blob:")) {
          URL.revokeObjectURL(preview);
        }
      });
    };
  }, [photoPreview]);

  useEffect(() => {
    if (auth?.accessToken) {
      dispatch(
        actions.fetchCaisseRequest({
          authToken: auth.accessToken,
        })
      );
    }
  }, [dispatch, auth?.accessToken]);

  useEffect(() => {
    if (createSuccessTransaction) {
      dispatch(actions.resetCreateTransactionSuccess());
    }
    if (updateSuccessTransaction) {
      dispatch(actions.resetUpdateTransactionSuccess());
    }
    if (deleteSuccessTransaction) {
      dispatch(actions.resetDeleteTransactionSuccess());
    }
  }, [
    createSuccessTransaction,
    updateSuccessTransaction,
    deleteSuccessTransaction,
    dispatch,
  ]);

  useEffect(() => {
    if (selectedTransaction) {
      const photoArray = normalizePhoto(selectedTransaction.Photo);
      setPhotoPreview(photoArray);
    } else {
      setPhotoPreview([]);
    }
  }, [selectedTransaction]);

  const parseParticipants = (
    participants: string | Participant[] | null | undefined
  ): Participant[] => {
    if (!participants) {
      console.warn("Participants is null or undefined:", participants);
      return [];
    }
    if (typeof participants === "string") {
      try {
        const parsed =
          participants === "" || participants === "[]"
            ? []
            : JSON.parse(participants);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        console.error("Failed to parse participants:", participants, e);
        return [];
      }
    }
    return Array.isArray(participants) ? participants : [];
  };

  const caissesArray = useSelector(caissesSelectors.selectAll);
  const accessibleCaisses = useMemo(() => {
    if (!auth?.user?.username) {
      console.warn("No username available in auth:", auth);
      return [];
    }
    return caissesArray.filter((caisse) => {
      const participants = parseParticipants(caisse.participants);
      return participants.some((p) => p.username === auth.user.username);
    });
  }, [caissesArray, auth?.user?.username]);

  useEffect(() => {
    if (selectedCaisseId === null && accessibleCaisses.length > 0) {
      setSelectedCaisseId(accessibleCaisses[0].id);
    }
  }, [accessibleCaisses, selectedCaisseId]);

  const years = useMemo(() => {
    const yearList = ["all"];
    for (let year = 2025; year <= 2025; year++) {
      yearList.push(year.toString());
    }
    return yearList;
  }, []);
  const getUserName = (userId?: number) => {
    if (!userId) return "Utilisateur inconnu";
    const user = users[userId];
    return user
      ? `${user.username} ${user.lastName || ""}`.trim() || user.username
      : "Utilisateur inconnu";
  };
  const transactionColumns = useMemo(
    () => [
      // {
      //   id: "id",
      //   label: t("ID"),
      //   sortable: true,
      //   width: "80px",
      //   render: (tx: Transaction) => <Typography>{tx.id}</Typography>,
      // },
      {
        id: "amount",
        label: t("Amount"),
        sortable: true,
        width: "150px",
        render: (tx: Transaction) => (
          <Chip
            label={`${tx.amount > 0 ? "" : ""}${Math.max(tx.amount, 0)} ${t(
              "dt"
            )}`}
            color={tx.amount > 0 ? "success" : "default"}
            sx={{ width: "100%" }}
          />
        ),
      },
      {
        id: "userId",
        label: t("Author"),
        sortable: true,
        width: "150px",
        render: (tx: Transaction) => (
          <Typography>{getUserName(tx.userId)}</Typography>
        ),
      },
      {
        id: "createdAt",
        label: t("Date"),
        sortable: true,
        width: "200px",
        render: (tx: Transaction) => (
          <Typography>{formatDate(tx.createdAt)}</Typography>
        ),
      },
      {
        id: "description",
        label: t("Description"),
        width: "250px",
        render: (tx: Transaction) => (
          <Typography>{tx.description || "Aucune description"}</Typography>
        ),
      },
      {
        id: "Photo",
        label: t("Photo"),
        width: "200px",
        render: (tx: Transaction) => {
          const photoArray = normalizePhoto(tx.Photo);
          return photoArray.length > 0 ? (
            <Box display="flex" gap={1} flexWrap="wrap">
              {photoArray.map((photo, index) => (
                <img
                  key={index}
                  src={photo}
                  alt={`Transaction ${index}`}
                  style={{
                    width: "50px",
                    height: "50px",
                    objectFit: "cover",
                    borderRadius: "4px",
                  }}
                  onError={() => console.error("Failed to load image:", photo)}
                />
              ))}
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              {t("Aucune")}
            </Typography>
          );
        },
      },
    ],
    [t]
  );
  const months = useMemo(() => {
    const monthList = ["all"];
    for (let month = 1; month <= 12; month++) {
      monthList.push(month.toString());
    }
    return monthList;
  }, []);
  const handleSearch = () => {
    if (selectedCaisseId !== null && auth?.accessToken) {
      dispatch(
        actions.fetchTransactionsRequest({
          caisseId: selectedCaisseId,
          token: auth.accessToken,
          Tpage: filters.Tpage + 1,
          Tlimit: TrowsPerPage,
          annee: yearFilter !== "all" ? parseInt(yearFilter) : undefined,
          mois: monthFilter !== "all" ? parseInt(monthFilter) : undefined,
          TpageSize: TrowsPerPage,
        })
      );
    }
  };
  const [Tfilters, TsetFilters] = useState<{
    page: number;
    limit: number;
    searchQuery: string;
    annee?: number;
    mois?: number;
  }>({
    page: 1,
    limit: 5,
    searchQuery: "",
  });
  useEffect(() => {
    if (selectedCaisseId !== null && auth?.accessToken) {
      dispatch(
        actions.fetchTransactionsRequest({
          caisseId: selectedCaisseId,
          token: auth.accessToken,
          Tpage: Tfilters.page,
          Tlimit: Tfilters.limit,
          annee: yearFilter !== "all" ? parseInt(yearFilter) : undefined,
          mois: monthFilter !== "all" ? parseInt(monthFilter) : undefined,
          TpageSize: TrowsPerPage,
        })
      );
    }
  }, [
    selectedCaisseId,
    dispatch,
    auth?.accessToken,
    Tfilters.page,
    Tfilters.limit,
    yearFilter,
    monthFilter,
    TrowsPerPage,
  ]);
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      let matchesYear = true;
      let matchesMonth = true;
      let matchesUser = true;

      if (yearFilter !== "all" && tx.createdAt) {
        matchesYear = getYear(new Date(tx.createdAt)).toString() === yearFilter;
      }

      if (monthFilter !== "all" && tx.createdAt) {
        matchesMonth =
          (getMonth(new Date(tx.createdAt)) + 1).toString() === monthFilter;
      }

      if (userFilter && auth?.user?.id) {
        matchesUser = tx.userId === auth.user.id;
      }

      return matchesYear && matchesMonth && matchesUser;
    });
  }, [
    handleSearch,
    transactions,
    yearFilter,
    monthFilter,
    userFilter,
    auth?.user?.id,
    selectedCaisseId,
  ]);

  const handleOpenTransactionModal = (transaction?: ITransaction) => {
    setSelectedTransaction(transaction || null);
    if (transaction) {
      const photoArray = normalizePhoto(transaction.Photo);
      transactionFormik.setValues({
        amount: transaction.amount
          ? Math.abs(transaction.amount).toString()
          : "",
        description: transaction.description || "",
        Photo: photoArray,
      });
      setPhotoPreview(photoArray);
    } else {
      transactionFormik.resetForm();
      setPhotoPreview([]);
    }
    setOpenTransactionModal(true);
  };

  const handleCloseTransactionModal = () => {
    setOpenTransactionModal(false);
    setSelectedTransaction(null);
    transactionFormik.resetForm();
    setPhotoPreview([]);
  };


  const handleCloseActionModal = () => {
    setOpenActionModal(false);
    setSelectedTransaction(null);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Inconnu";
    return format(new Date(dateString), "PPpp", { locale: fr });
  };

  const getTransactionColor = (amount: number) => {
    return amount >= 0 ? "success.main" : "error.main";
  };

  const getTransactionSign = (amount: number) => {
    return amount >= 0 ? "+" : "";
  };

  const isRetraitButtonDisabled = () => {
    return (
      !transactionFormik.values.amount ||
      !transactionFormik.values.description ||
      transactionFormik.values.Photo.length === 0 ||
      !!transactionFormik.errors.amount ||
      !!transactionFormik.errors.description ||
      !!transactionFormik.errors.Photo ||
      !!amountError
    );
  };

  const {
   
    Ttotal,

    
  } = useSelector((state: RootState) => state.fees);
  const handleTPageChange = (newPage: number) => {
    const maxPage = Math.ceil(Ttotal / TrowsPerPage) - 1;
    const validPage = Math.max(0, Math.min(newPage, maxPage));
    TsetPage(validPage);
    TsetFilters({ ...Tfilters, page: validPage + 1 }); // One-based for API
  };

  const handleTRowsPerPageChange = (newRowsPerPage: number) => {
    TsetRowsPerPage(newRowsPerPage);
    TsetPage(0);
    TsetFilters({ ...Tfilters, page: 1, limit: newRowsPerPage });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{ fontWeight: 700, color: "primary.main" }}
        >
          <AccountBalanceIcon
            sx={{ verticalAlign: "middle", mr: 1, fontSize: "inherit" }}
          />
          {t("Cash Management")}
        </Typography>
        <Divider sx={{ my: 2 }} />
      </Box>

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <FormControl fullWidth sx={{ maxWidth: 300, mb: 2 }}>
            <InputLabel id="select-caisse-label">
              {t("Select a box")}
            </InputLabel>
            <Select
              labelId="select-caisse-label"
              id="select-caisse"
              value={selectedCaisseId ?? ""}
              label={t("Select a box")}
              onChange={(e) => {
                const value = e.target.value;
                setSelectedCaisseId(value ? Number(value) : null);
              }}
              displayEmpty
            >
              {accessibleCaisses.length === 0 ? (
                <MenuItem disabled value="">
                  {t("No cash register available")}
                </MenuItem>
              ) : (
                accessibleCaisses.map((caisse) => (
                  <MenuItem key={caisse.id} value={caisse.id}>
                    {caisse.name}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
        </Box>

        {loading && <LinearProgress sx={{ mb: 2 }} />}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            <AlertTitle>{t("Error")}</AlertTitle>
            {error}
          </Alert>
        )}

        {accessibleCaisses.length === 0 ? (
          <Typography
            variant="body1"
            color="text.secondary"
            textAlign="center"
            py={4}
          >
            {t("You do not have access to any cash register.")}
          </Typography>
        ) : selectedCaisseId === null ? (
          <Typography
            variant="body1"
            color="text.secondary"
            textAlign="center"
            py={4}
          >
            {t("Please select a cash register to view the details.")}
          </Typography>
        ) : (
          <>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={6}>
                <Card elevation={3}>
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={2}>
                      <Avatar sx={{ bgcolor: "primary.main", mr: 2 }}>
                        <AttachMoneyIcon />
                      </Avatar>
                      <Typography variant="h6" component="div">
                        {t("Current Balance")}
                      </Typography>
                    </Box>
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 700,
                        color:
                          currentBalance >= 0 ? "success.main" : "error.main",
                      }}
                    >
                      {currentBalance} DT
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card elevation={3}>
                  <CardContent>
                    <Typography sx={{ mt: "20px" }} variant="h6" gutterBottom>
                      {t("Actions")}
                    </Typography>
                    <Box display="flex" gap={2} flexWrap="wrap">
                      <Tooltip title={t("Add withdrawal")}>
                        <Button
                          variant="contained"
                          color="success"
                          onClick={() => handleOpenTransactionModal()}
                          startIcon={<PointOfSaleIcon />}
                          disabled={selectedCaisseId === null}
                          sx={{ flexGrow: 1, minWidth: 120 }}
                        >
                          {t("Withdrawal")}
                        </Button>
                      </Tooltip>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Card elevation={3} sx={{ mb: 4 }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <HistoryIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6" component="div">
                    {t("Transaction History")}
                  </Typography>
                </Box>

                <Box
                  display="flex"
                  gap={2}
                  mb={3}
                  flexWrap="wrap"
                  alignItems="center"
                >
                  <FormControl sx={{ minWidth: 150 }}>
                    <InputLabel id="year-filter-label">{t("Year")}</InputLabel>
                    <Select
                      labelId="year-filter-label"
                      value={yearFilter}
                      label={t("Year")}
                      onChange={(e) => setYearFilter(e.target.value)}
                    >
                      {years.map((year) => (
                        <MenuItem key={year} value={year}>
                          {year === "all" ? t("All") : year}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl sx={{ minWidth: 150 }}>
                    <InputLabel id="month-filter-label">
                      {t("Month")}
                    </InputLabel>
                    <Select
                      labelId="month-filter-label"
                      value={monthFilter}
                      label={t("Month")}
                      onChange={(e) => setMonthFilter(e.target.value)}
                    >
                      {months.map((month) => (
                        <MenuItem key={month} value={month}>
                          {month === "all"
                            ? t("All")
                            : format(
                                new Date(2023, parseInt(month) - 1),
                                "MMMM",
                                {
                                  locale: fr,
                                }
                              )}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  {auth?.user.role !== "Syndic" && (
                    <FormControl sx={{ minWidth: 120 }}>
                      <Button
                        variant={userFilter ? "contained" : "outlined"}
                        color="primary"
                        onClick={() => setUserFilter(!userFilter)}
                      >
                        {userFilter
                          ? t("Show All Transactions")
                          : t("My Transactions Only")}
                      </Button>
                    </FormControl>
                  )}
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSearch}
                    disabled={selectedCaisseId === null || !auth?.accessToken}
                  >
                    {t("Search")}
                  </Button>
                </Box>

                <Table
                  columns={transactionColumns}
                  data={filteredTransactions}
                  total={Ttotal}
                  page={Tpage}
                  rowsPerPage={TrowsPerPage}
                  orderBy="createdAt"
                  orderDirection="desc"
                  onPageChange={handleTPageChange}
                  onRowsPerPageChange={handleTRowsPerPageChange}
                  onSort={(columnId) => {
                    console.log("Sort by", columnId);
                  }}
                  noDataMessage={
                    yearFilter !== "all" || monthFilter !== "all"
                      ? t("No transactions match your search")
                      : t("No transactions available")
                  }
                />
              </CardContent>
            </Card>
          </>
        )}
      </Paper>

      <Modal open={openTransactionModal} onClose={handleCloseTransactionModal}>
        <Box sx={modalStyle}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h6" component="h2">
              {t("New withdrawal")}
            </Typography>
            <IconButton onClick={handleCloseTransactionModal}>
              <CloseIcon />
            </IconButton>
          </Box>
          <form onSubmit={transactionFormik.handleSubmit}>
            <TextField
              label={t("Amount (DT)")}
              fullWidth
              name="amount"
              type="number"
              value={transactionFormik.values.amount}
              onChange={handleAmountChange}
              onBlur={transactionFormik.handleBlur}
              sx={{ mt: 2 }}
              InputProps={{
                startAdornment: <Typography sx={{ mr: 1 }}>DT</Typography>,
              }}
              inputProps={{
                step: "0.01",
                min: "0.01",
              }}
              error={
                (transactionFormik.touched.amount &&
                  !!transactionFormik.errors.amount) ||
                !!amountError
              }
              helperText={
                (transactionFormik.touched.amount &&
                  transactionFormik.errors.amount) ||
                amountError
              }
            />
            <TextField
              label={t("Description")}
              fullWidth
              name="description"
              value={transactionFormik.values.description}
              onChange={transactionFormik.handleChange}
              onBlur={transactionFormik.handleBlur}
              sx={{ mt: 2 }}
              multiline
              rows={3}
              error={
                transactionFormik.touched.description &&
                !!transactionFormik.errors.description
              }
              helperText={
                transactionFormik.touched.description &&
                transactionFormik.errors.description
              }
            />
            <Box mt={2}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<UploadFileIcon />}
              >
                {t("Upload photos")}
                <input
                  type="file"
                  name="photos"
                  hidden
                  multiple
                  accept="image/*"
                  onChange={handlePhotoChange}
                />
              </Button>
              {transactionFormik.touched.Photo &&
                transactionFormik.errors.Photo && (
                  <Typography color="error" variant="caption" mt={1}>
                    {transactionFormik.errors.Photo}
                  </Typography>
                )}
            </Box>

            {photoPreview.length > 0 && (
              <Box mt={2}>
                <Box display="flex" flexWrap="wrap" gap={2} mt={1}>
                  {photoPreview.map((src, index) => (
                    <Box
                      key={index}
                      position="relative"
                      width={120}
                      height={120}
                      sx={{
                        borderRadius: 1,
                        boxShadow: 1,
                        overflow: "hidden",
                      }}
                    >
                      <Box
                        component="img"
                        src={src}
                        alt={`Preview ${index + 1}`}
                        sx={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                      <IconButton
                        size="small"
                        onClick={() => {
                          if (src.startsWith("blob:")) {
                            URL.revokeObjectURL(src);
                          }
                          const updatedPreviews = [...photoPreview];
                          updatedPreviews.splice(index, 1);
                          setPhotoPreview(updatedPreviews);

                          const updatedPhotos = [
                            ...transactionFormik.values.Photo,
                          ];
                          updatedPhotos.splice(index, 1);
                          transactionFormik.setFieldValue(
                            "Photo",
                            updatedPhotos
                          );
                        }}
                        sx={{
                          position: "absolute",
                          top: 4,
                          left: 4,
                          backgroundColor: "rgba(255,255,255,0.7)",
                          "&:hover": {
                            backgroundColor: "rgba(255,255,255,1)",
                          },
                        }}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            <Box display="flex" justifyContent="flex-end" gap={2} mt={3}>
              <Button
                variant="outlined"
                onClick={handleCloseTransactionModal}
                disabled={isProcessing}
              >
                {t("Cancel")}
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="success"
                disabled={isProcessing || isRetraitButtonDisabled()}
              >
                {isProcessing ? "En cours..." : t("Withdrawal")}
              </Button>
            </Box>
          </form>
        </Box>
      </Modal>

      <Dialog
        open={openTransactionConfirmDialog}
        onClose={() => setOpenTransactionConfirmDialog(false)}
      >
        <DialogTitle>{t("Confirm the transaction")}</DialogTitle>
        <DialogContent>
          <Typography>
            {t("Are you sure you want to make the DT withdrawal?")}
          </Typography>
          {pendingTransaction?.Photo && pendingTransaction.Photo.length > 0 && (
            <Box mt={2}>
              <Box display="flex" flexWrap="wrap" gap={2} mt={1}>
                {pendingTransaction.Photo.map((photo, index) => (
                  <img
                    key={index}
                    src={
                      photo instanceof File ? URL.createObjectURL(photo) : photo
                    }
                    alt={`Preview ${index + 1}`}
                    style={{
                      maxWidth: "100px",
                      maxHeight: "100px",
                      objectFit: "contain",
                      borderRadius: "4px",
                    }}
                  />
                ))}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenTransactionConfirmDialog(false);
              setPendingTransaction(null);
            }}
            disabled={isProcessing}
          >
            {t("Cancel")}
          </Button>
          <Button
            onClick={confirmTransaction}
            color="success"
            variant="contained"
            disabled={isProcessing}
          >
            {t("Confirm")}
          </Button>
        </DialogActions>
      </Dialog>

      <Modal open={openActionModal} onClose={handleCloseActionModal}>
        <Box sx={modalStyle}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h6" component="h2">
              {t("Transaction Details")}
            </Typography>
            <IconButton onClick={handleCloseActionModal}>
              <CloseIcon />
            </IconButton>
          </Box>

          {selectedTransaction && (
            <>
              <Box mb={3}>
                <Typography variant="subtitle1">{t("Amount")}:</Typography>
                <Typography
                  variant="h5"
                  sx={{
                    color: getTransactionColor(selectedTransaction.amount),
                  }}
                >
                  {getTransactionSign(selectedTransaction.amount)}
                  {Math.abs(selectedTransaction.amount)} DT
                </Typography>
              </Box>

              <Box mb={3}>
                <Typography variant="subtitle1">{t("Description")}:</Typography>
                <Typography variant="body1">
                  {selectedTransaction.description || "Aucune description"}
                </Typography>
              </Box>

              <Box mb={3}>
                <Typography variant="subtitle1">{t("Photo")}:</Typography>
                {normalizePhoto(selectedTransaction.Photo).length > 0 ? (
                  <Box display="flex" gap={1} flexWrap="wrap">
                    {normalizePhoto(selectedTransaction.Photo).map(
                      (photo, index) => (
                        <img
                          key={index}
                          src={photo}
                          alt={`Transaction ${index}`}
                          style={{
                            width: "50px",
                            height: "50px",
                            objectFit: "cover",
                            borderRadius: "4px",
                          }}
                          onError={() =>
                            console.error("Failed to load image:", photo)
                          }
                        />
                      )
                    )}
                  </Box>
                ) : (
                  <Typography variant="body1">{t("None")}</Typography>
                )}
              </Box>

              <Box mb={3}>
                <Typography variant="subtitle1">{t("Created on")}:</Typography>
                <Typography variant="body1">
                  {formatDate(selectedTransaction.createdAt)}
                </Typography>
              </Box>

              <Box mb={3}>
                <Typography variant="subtitle1">{t("Updated on")}:</Typography>
                <Typography variant="body1">
                  {formatDate(selectedTransaction.updatedAt)}
                </Typography>
              </Box>
            </>
          )}
        </Box>
      </Modal>
    </Container>
  );
};

export default Caisse;
