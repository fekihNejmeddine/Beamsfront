import english from "../assets/us.jpg";
import arabic from "../assets/tunisia.png";
import french from "../assets/french.jpg";

// Définir le type pour une langue
type Language = {
  label: string;
  flag: string;
};

// Définir le type pour l'objet des langues
type Languages = {
  [key: string]: Language;
};

const languages: Languages = {
  en: { label: "English", flag: english },
  ar: { label: "Arabic", flag: arabic },
  fr: { label: "French", flag: french },
};

export default languages;