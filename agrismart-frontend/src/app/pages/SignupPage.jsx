import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Leaf, Mail, Lock, User, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
export const SignupPage = () => {
    const languages = [
        { code: 'en', label: 'EN', full: 'English' },
        { code: 'hi', label: 'हि', full: 'हिंदी' },
        { code: 'pa', label: 'ਪੰ', full: 'ਪੰਜਾਬੀ' },
        { code: 'ta', label: 'த', full: 'தமிழ்' },
        { code: 'te', label: 'తె', full: 'తెలుగు' },
        { code: 'mr', label: 'म', full: 'मराठी' },
    ];
    const { t, i18n } = useTranslation();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'farmer',
        profileImage: null,
    });
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { register } = useAuth();
    const changeLanguage = (code) => {
        i18n.changeLanguage(code);
        localStorage.setItem('i18nextLng', code);
    };
    const navigate = useNavigate();
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    const handleImageChange = (e) => {
        const file = e.target.files?.[0] || null;
        setFormData({ ...formData, profileImage: file });
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }
        setIsLoading(true);
        try {
            await register({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: formData.role,
                profileImage: formData.profileImage,
            });
            toast.success('Account created successfully!');
            navigate('/dashboard');
        }
        catch (err) {
            const message = err?.response?.data?.message ||
                err?.message ||
                'Signup failed. Please try again.';
            setError(message);
        }
        finally {
            setIsLoading(false);
        }
    };
    return (<div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-lime-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
            <Leaf className="w-7 h-7 text-white"/>
          </div>
          <span className="text-2xl font-bold text-primary">AgriSmart</span>
        </Link>

        <Card className="border-2">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">{t('auth.createAccount')}</CardTitle>
            <CardDescription className="text-center">
              {t('auth.createAccountSubtitle')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 space-y-2">
              <p className="text-sm font-medium text-muted-foreground">{t('auth.selectLanguage')}</p>
              <div className="flex flex-wrap gap-2">
                {languages.map((lang) => {
                const active = i18n.resolvedLanguage === lang.code;
                return (<button key={lang.code} type="button" onClick={() => changeLanguage(lang.code)} className={`px-3 py-1 rounded-full text-sm border ${active ? 'bg-green-600 text-white border-green-600' : 'border-gray-300 text-gray-700 dark:text-gray-200'}`}>
                      {lang.full}
                    </button>);
            })}
              </div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-600 dark:text-red-400">
                  <AlertCircle className="w-5 h-5"/>
                  <span className="text-sm">{error}</span>
                </motion.div>)}

              <div className="space-y-2">
                <Label htmlFor="name">{t('auth.name')}</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-5 h-5 text-gray-400"/>
                  <Input id="name" name="name" type="text" placeholder={t('auth.name')} value={formData.name} onChange={handleChange} className="pl-10" required/>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t('auth.email')}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400"/>
                  <Input id="email" name="email" type="email" placeholder={t('auth.email')} value={formData.email} onChange={handleChange} className="pl-10" required/>
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t('auth.accountType')}</Label>
                <RadioGroup value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })} className="grid grid-cols-2 gap-4">
                  <div>
                    <RadioGroupItem value="farmer" id="farmer" className="peer sr-only"/>
                    <Label htmlFor="farmer" className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all">
                      <Leaf className="mb-2 h-6 w-6"/>
                      <span className="font-medium">{t('auth.farmer')}</span>
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="buyer" id="buyer" className="peer sr-only"/>
                    <Label htmlFor="buyer" className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all">
                      <User className="mb-2 h-6 w-6"/>
                      <span className="font-medium">{t('auth.buyer')}</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t('auth.password')}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400"/>
                  <Input id="password" name="password" type={!showPassword? "password" : "text"} placeholder="••••••••" value={formData.password} onChange={handleChange} className="pl-10" required/>
                <div
  className="absolute right-3 top-3 cursor-pointer text-gray-400"
  onClick={() => setShowPassword(!showPassword)}
>
  {!showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
</div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t('auth.confirmPassword')}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400"/>
                  <Input id="confirmPassword" name="confirmPassword" type={!showPassword? "password" : "text"} placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange} className="pl-10" required/>
                <div
  className="absolute right-3 top-3 cursor-pointer text-gray-400"
  onClick={() => setShowPassword(!showPassword)}
>
  {!showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
</div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="profileImage">{t('auth.profileImage')} <span className="text-xs text-muted-foreground">(optional)</span></Label>
                <Input id="profileImage" name="profileImage" type="file" accept="image/*" onChange={handleImageChange}/>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? t('common.processing') : t('auth.createAccount')}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
              {t('auth.hasAccount')}{' '}
              <Link to="/login" className="text-primary hover:underline font-medium">
                {t('auth.login')}
              </Link>
            </div>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
          {t('auth.terms')}
        </p>
      </motion.div>
    </div>);
};
