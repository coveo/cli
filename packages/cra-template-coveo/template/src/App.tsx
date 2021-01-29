import SearchPage from './Components/SearchPage';
import Hero from './Components/Hero';
import logo from './logo.svg';

function App() {
  return (
    <div className="App">
      <Hero logo={logo} welcome="Welcome to Your Coveo React.js Search Page" />
      <SearchPage />
    </div>
  );
}

export default App;
