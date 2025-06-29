import axios from "axios";
import { BrowserRouter as Router } from "react-router-dom";
import { UserContextProvider } from "./UserContext";
import Routes from "./Routes";

function App() {
  axios.defaults.baseURL = "http://13.127.179.207:8000/";
  axios.defaults.withCredentials = true;

  return (
    <Router>
      <UserContextProvider>
        <Routes />
      </UserContextProvider>
    </Router>
  );
}

export default App;
