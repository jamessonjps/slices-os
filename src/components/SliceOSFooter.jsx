import { Link } from 'react-router-dom';

export default function SliceOSFooter({ dark = false }) {
  return (
    <div className={`text-center py-6 text-xs flex flex-col items-center gap-2 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
      <div className="flex gap-4 mb-2">
        <Link to="/TermsOfUse" className="hover:underline hover:text-slate-900 dark:hover:text-slate-200">
          Termos de Uso
        </Link>
        <Link to="/PrivacyPolicy" className="hover:underline hover:text-slate-900 dark:hover:text-slate-200">
          Privacidade e Segurança
        </Link>
      </div>
      <div>
        Powered by <span className="font-semibold tracking-wide">SliceOS</span>
      </div>
    </div>
  );
}