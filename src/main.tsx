import ReactDOM from 'react-dom/client';
import App from './App';
import i18n from './i18n/i18n';

// Set document title from translation and update on language change
const setDocumentTitle = () => {
  try {
    document.title = i18n.t('title') || document.title;
    const desc = document.querySelector('meta[name="description"]');
    if (desc) {
      desc.setAttribute('content', i18n.t('description') || desc.getAttribute('content') || '');
    }
  } catch (e) {
    // ignore when running in non-browser environments or i18n not ready
  }
};

i18n.on && i18n.on('languageChanged', setDocumentTitle);
setDocumentTitle();

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
