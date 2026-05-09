import { useEffect, useRef, useState } from 'react';
import { Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from './ui/button';

const languages = [
    { code: 'en', label: 'EN', full: 'English' },
    { code: 'hi', label: 'हि', full: 'हिंदी' },
    { code: 'pa', label: 'ਪੰ', full: 'ਪੰਜਾਬੀ' },
    { code: 'ta', label: 'த', full: 'தமிழ்' },
    { code: 'te', label: 'తె', full: 'తెలుగు' },
    { code: 'mr', label: 'म', full: 'मराठी' },
];

const LanguageSwitcher = () => {
    const { i18n, t } = useTranslation();
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    const current = i18n.resolvedLanguage || 'en';
    const active = languages.find((lang) => lang.code === current) || languages[0];
    useEffect(() => {
        const handleClick = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => {
            document.removeEventListener('mousedown', handleClick);
        };
    }, []);
    const changeLanguage = (code) => {
        i18n.changeLanguage(code);
        localStorage.setItem('i18nextLng', code);
        setOpen(false);
    };
    return (<div className="relative" ref={ref}>
      <Button variant="ghost" size="sm" className="flex items-center gap-2" onClick={() => setOpen((prev) => !prev)}>
        <Globe className="w-4 h-4"/>
        <span className="font-medium">{active.label}</span>
      </Button>
      {open && (<div className="absolute right-0 mt-2 w-48 rounded-md border bg-white dark:bg-gray-800 shadow-lg z-50">
          <div className="px-3 py-2 text-xs text-muted-foreground border-b">
            {t('language.label')}
          </div>
          <div className="py-1">
            {languages.map((lang) => (<button key={lang.code} onClick={() => changeLanguage(lang.code)} className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 ${lang.code === active.code ? 'text-green-600 font-semibold' : 'text-gray-700 dark:text-gray-200'}`}>
                <span className="w-6">{lang.label}</span>
                <span>{lang.full}</span>
              </button>))}
          </div>
        </div>)}
    </div>);
};

export default LanguageSwitcher;
