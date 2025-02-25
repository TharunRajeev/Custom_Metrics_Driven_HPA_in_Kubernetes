import "./App.css";
import AddTask from "./components/AddTask";
import AppFooter from "./components/AppFooter";
import AppHeader from "./components/AppHeader";
import QueueLength from "./components/QueueLength";

function App() {
  return (
    <div>
      <AppHeader />
      <QueueLength />
      <AddTask />
      <AppFooter />
    </div>
  );
}

export default App;
