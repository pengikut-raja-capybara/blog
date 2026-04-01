import { Navigate, Route, Routes } from 'react-router';
import { AppLayout } from './components/layout';
import { About, BlogDetail, Contact, Home } from './pages';

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/blog/" element={<Home />} />
        <Route path="/blog/about" element={<About />} />
        <Route path="/blog/contact" element={<Contact />} />
        <Route path="/blog/:slug" element={<BlogDetail />} />
        <Route path="*" element={<Navigate to="/blog/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
