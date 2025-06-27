import { LanguageProvider } from "./context/LanguageContext";
import Routes from "./routes/index";
import { Container } from "@mui/material";

function App() {
  return (
    <LanguageProvider>
      <Container maxWidth={false} style={{ padding: 0 }}>
        <Routes />
      </Container>
    </LanguageProvider>
  );
}

export default App;