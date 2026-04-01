import { Navigate, Route, Routes } from 'react-router';
import { AppLayout } from './components/layout';
import { About, BlogDetail, Contact, Home } from './pages';

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/blog/:slug" element={<BlogDetail />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
