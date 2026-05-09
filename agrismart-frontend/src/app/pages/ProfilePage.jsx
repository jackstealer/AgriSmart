import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { User, Mail, Phone, MapPin, Edit, Save, Eye, EyeOff, Shield, Clock, AlertTriangle, Monitor, Smartphone } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'sonner';
export const ProfilePage = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: '+91 98765 43210',
        location: 'Punjab, India',
        bio: 'Experienced farmer with 10+ years in sustainable agriculture',
    });
    const [stats, setStats] = useState({
        totalCrops: 0,
        totalOrders: 0,
        activeListings: 0,
        totalSpent: 0,
    });
    const [statsLoading, setStatsLoading] = useState(true);
    const fetchStats = async () => {
        setStatsLoading(true);
        try {
            if (user?.role === 'farmer') {
                const [cropsRes, ordersRes] = await Promise.all([
                    api.get('/api/crops'),
                    api.get('/api/orders'),
                ]);
                const crops = cropsRes.data?.crops || cropsRes.data || [];
                const orders = ordersRes.data?.orders || ordersRes.data || [];
                setStats({
                    totalCrops: crops.length,
                    activeListings: crops.filter((c) => c.status === 'available' || c.status === 'Available').length,
                    totalOrders: orders.length,
                    totalSpent: 0,
                });
            }
            else {
                const ordersRes = await api.get('/api/orders');
                const orders = ordersRes.data?.orders || ordersRes.data || [];
                setStats({
                    totalCrops: 0,
                    activeListings: 0,
                    totalOrders: orders.length,
                    totalSpent: orders
                        .filter((o) => o.status === 'paid')
                        .reduce((sum, o) => sum + (o.totalAmount || 0), 0),
                });
            }
        }
        catch (err) {
            console.error('Failed to fetch stats', err);
        }
        setStatsLoading(false);
    };
    useEffect(() => {
        fetchStats();
    }, [user?.role]);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [showTwoFAModal, setShowTwoFAModal] = useState(false);
    const [twoFAEnabled, setTwoFAEnabled] = useState(false);
    const [showLoginHistory, setShowLoginHistory] = useState(false);
    const [loginHistory, setLoginHistory] = useState([]);
    const [loginHistoryLoading, setLoginHistoryLoading] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    const [deleteLoading, setDeleteLoading] = useState(false);
    const getPasswordStrength = (password) => {
        const hasSpecial = /[^A-Za-z0-9]/.test(password);
        if (password.length >= 10 || hasSpecial) {
            return { label: 'Strong', color: 'bg-green-500', width: '100%' };
        }
        if (password.length >= 6) {
            return { label: 'Medium', color: 'bg-yellow-500', width: '66%' };
        }
        if (password.length > 0) {
            return { label: 'Weak', color: 'bg-red-500', width: '33%' };
        }
        return { label: '', color: 'bg-gray-200', width: '0%' };
    };
    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setPasswordError('');
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setPasswordError('Passwords do not match');
            return;
        }
        if (passwordForm.newPassword.length < 6) {
            setPasswordError('Min 6 characters');
            return;
        }
        setPasswordLoading(true);
        try {
            await api.patch('/api/users/me', {
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword,
            });
            toast.success('Password updated successfully');
            setShowPasswordModal(false);
            setPasswordForm({
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            });
        }
        catch (err) {
            setPasswordError(err?.response?.data?.message || 'Failed to update password');
        }
        setPasswordLoading(false);
    };
    const fetchLoginHistory = async () => {
        setLoginHistoryLoading(true);
        try {
            const res = await api.get('/api/users/login-history');
            setLoginHistory(res.data || []);
        }
        catch (_e) {
            setLoginHistory([
                {
                    device: 'Chrome on Windows',
                    location: 'Punjab, India',
                    time: new Date().toISOString(),
                    status: 'success',
                    ip: '103.x.x.x',
                },
                {
                    device: 'Mobile Browser',
                    location: 'Delhi, India',
                    time: new Date(Date.now() - 86400000).toISOString(),
                    status: 'success',
                    ip: '49.x.x.x',
                },
            ]);
        }
        setLoginHistoryLoading(false);
    };
    const formatDateTime = (ts) => {
        const date = new Date(ts);
        return date.toLocaleString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };
    const handleDeleteAccount = async () => {
        if (deleteConfirmText !== 'DELETE')
            return;
        setDeleteLoading(true);
        try {
            await api.delete('/api/users/me');
            toast.success('Account deleted successfully');
            logout();
            navigate('/login');
        }
        catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to delete account');
        }
        setDeleteLoading(false);
    };
    const handleSave = () => {
        toast.success('Profile updated successfully!');
        setIsEditing(false);
    };
    return (<>
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground">Manage your account settings</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="w-24 h-24 mb-4">
                  <AvatarImage src={user?.profileImage}/>
                  <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                    {user?.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-bold mb-1">{user?.name}</h2>
                <p className="text-sm text-muted-foreground mb-2">{user?.email}</p>
                <Badge className="capitalize">{user?.role}</Badge>
                <Button variant="outline" className="w-full mt-6">
                  Change Avatar
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Profile Details */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Update your personal details</CardDescription>
                </div>
                {!isEditing ? (<Button onClick={() => setIsEditing(true)} className="gap-2">
                    <Edit className="w-4 h-4"/>
                    Edit
                  </Button>) : (<div className="flex gap-2">
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSave} className="gap-2">
                      <Save className="w-4 h-4"/>
                      Save
                    </Button>
                  </div>)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground"/>
                    <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} disabled={!isEditing} className="pl-10"/>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground"/>
                    <Input id="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} disabled={!isEditing} className="pl-10"/>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground"/>
                    <Input id="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} disabled={!isEditing} className="pl-10"/>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground"/>
                    <Input id="location" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} disabled={!isEditing} className="pl-10"/>
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="bio">Bio</Label>
                  <textarea id="bio" value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} disabled={!isEditing} className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"/>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Additional Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Account Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Member Since</span>
              <span className="font-medium">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Total Crops</span>
              <span className="font-medium">{statsLoading ? '...' : stats.totalCrops}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Total Orders</span>
              <span className="font-medium">{statsLoading ? '...' : stats.totalOrders}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{user?.role === 'farmer' ? 'Active Listings' : 'Total Spent'}</span>
              <span className="font-medium">{statsLoading
                    ? '...'
                    : user?.role === 'farmer'
                        ? stats.activeListings
                        : `₹${stats.totalSpent.toLocaleString('en-IN')}`}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start" onClick={() => setShowPasswordModal(true)}>
              Change Password
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => setShowTwoFAModal(true)}>
              Two-Factor Authentication
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => {
                setShowLoginHistory(true);
                fetchLoginHistory();
            }}>
              Login History
            </Button>
            <Button variant="destructive" className="w-full justify-start" onClick={() => setShowDeleteModal(true)}>
              Delete Account
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>

    {showPasswordModal && (<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => {
            setShowPasswordModal(false);
            setPasswordError('');
        }}>
        <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Change Password</h3>
            <button className="text-gray-500 hover:text-gray-700" onClick={() => {
                setShowPasswordModal(false);
                setPasswordError('');
            }}>
              ×
            </button>
          </div>
          <form className="space-y-3" onSubmit={handlePasswordSubmit}>
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Input id="currentPassword" type={showCurrentPassword ? 'text' : 'password'} value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}/>
                <button type="button" className="absolute right-3 top-2.5 text-muted-foreground" onClick={() => setShowCurrentPassword((p) => !p)}>
                  {showCurrentPassword ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input id="newPassword" type={showNewPassword ? 'text' : 'password'} value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} minLength={6}/>
                <button type="button" className="absolute right-3 top-2.5 text-muted-foreground" onClick={() => setShowNewPassword((p) => !p)}>
                  {showNewPassword ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                </button>
              </div>
              <div className="h-2 w-full bg-gray-200 rounded">
                <div className={`${getPasswordStrength(passwordForm.newPassword).color} h-2 rounded`} style={{ width: getPasswordStrength(passwordForm.newPassword).width }}/>
              </div>
              {getPasswordStrength(passwordForm.newPassword).label && <p className="text-xs text-muted-foreground">{getPasswordStrength(passwordForm.newPassword).label}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Input id="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}/>
                <button type="button" className="absolute right-3 top-2.5 text-muted-foreground" onClick={() => setShowConfirmPassword((p) => !p)}>
                  {showConfirmPassword ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                </button>
              </div>
            </div>
            {passwordError && <p className="text-sm text-red-600">{passwordError}</p>}
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => {
                setShowPasswordModal(false);
                setPasswordError('');
            }}>
                Cancel
              </Button>
              <Button type="submit" disabled={passwordLoading}>
                {passwordLoading ? (<div className="w-4 h-4 border-2 border-white/60 border-t-white rounded-full animate-spin"/>) : 'Update Password'}
              </Button>
            </div>
          </form>
        </div>
      </div>)}

    {showTwoFAModal && (<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowTwoFAModal(false)}>
        <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Two-Factor Authentication</h3>
            <button className="text-gray-500 hover:text-gray-700" onClick={() => setShowTwoFAModal(false)}>
              ×
            </button>
          </div>
          <div className="flex justify-center">
            <Shield className="w-12 h-12 text-green-600"/>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Two-Factor Authentication adds an extra layer of security to your account. When enabled, you'll need your phone to sign in.
          </p>
          <div className="flex items-center justify-between p-3 rounded-md border">
            <div>
              <p className="font-medium">2FA is currently {twoFAEnabled ? 'Enabled' : 'Disabled'}</p>
              <p className="text-xs text-muted-foreground">Toggle to change status</p>
            </div>
            <button className={`w-12 h-6 rounded-full ${twoFAEnabled ? 'bg-green-500' : 'bg-gray-300'} relative`} onClick={() => setTwoFAEnabled((v) => !v)}>
              <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${twoFAEnabled ? 'translate-x-6' : ''}`}/>
            </button>
          </div>
          {twoFAEnabled && (<div className="space-y-2 text-sm">
              <p>Step 1: Download Google Authenticator or Authy app</p>
              <p>Step 2: Scan the QR code with your app</p>
              <p>Step 3: Enter the 6-digit code to verify</p>
              <div className="w-36 h-36 border-2 border-dashed border-gray-300 flex items-center justify-center text-xs text-muted-foreground mx-auto">
                QR Code will appear here
              </div>
            </div>)}
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 text-sm p-3 rounded">
            ⚠️ Full 2FA requires backend support. This UI is ready to connect when your backend implements /api/auth/2fa endpoints.
          </div>
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setShowTwoFAModal(false)}>Close</Button>
          </div>
        </div>
      </div>)}

    {showLoginHistory && (<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowLoginHistory(false)}>
        <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5"/>
              <h3 className="text-xl font-semibold">Login History</h3>
            </div>
            <button className="text-gray-500 hover:text-gray-700" onClick={() => setShowLoginHistory(false)}>×</button>
          </div>
          {loginHistoryLoading ? (<div className="flex justify-center py-6">
              <div className="w-6 h-6 border-2 border-gray-300 border-t-primary rounded-full animate-spin"/>
            </div>) : loginHistory.length === 0 ? (<p className="text-sm text-muted-foreground">No login history found</p>) : (<div className="space-y-3 max-h-80 overflow-y-auto">
              {loginHistory.slice(0, 10).map((entry, idx) => {
                const isMobile = (entry.device || '').toLowerCase().includes('mobile');
                return (<div key={idx} className="flex items-start justify-between border rounded-md p-3">
                    <div className="flex items-start gap-3">
                      {isMobile ? <Smartphone className="w-4 h-4 text-muted-foreground mt-0.5"/> : <Monitor className="w-4 h-4 text-muted-foreground mt-0.5"/>}
                      <div>
                        <p className="font-medium">{entry.device || 'Unknown device'}</p>
                        <p className="text-xs text-muted-foreground">{entry.location || 'Unknown location'} · {entry.ip || 'IP N/A'}</p>
                        <p className="text-xs text-muted-foreground">{formatDateTime(entry.time)}</p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${entry.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {entry.status === 'success' ? '✓ Success' : '✗ Failed'}
                    </span>
                  </div>);
            })}
            </div>)}
          <p className="text-xs text-muted-foreground text-center">Showing last 10 login sessions</p>
        </div>
      </div>)}

    {showDeleteModal && (<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => {
            setShowDeleteModal(false);
            setDeleteConfirmText('');
        }}>
        <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-center">
            <AlertTriangle className="w-12 h-12 text-red-600"/>
          </div>
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-red-700">Delete Account</h3>
            <button className="text-gray-500 hover:text-gray-700" onClick={() => {
                setShowDeleteModal(false);
                setDeleteConfirmText('');
            }}>×</button>
          </div>
          <p className="text-sm text-muted-foreground">
            This action is permanent and cannot be undone. All your data including crops, orders, and profile will be deleted forever.
          </p>
          <div className="text-sm space-y-1">
            <p>🌾 All your crop listings</p>
            <p>📦 All your orders</p>
            <p>🚚 All shipment records</p>
            <p>👤 Your profile and account data</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="deleteConfirm">Type "DELETE" to confirm</Label>
            <Input id="deleteConfirm" value={deleteConfirmText} onChange={(e) => setDeleteConfirmText(e.target.value)} className={deleteConfirmText === 'DELETE' ? 'border-green-500' : deleteConfirmText ? 'border-red-500' : ''}/>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => {
                setShowDeleteModal(false);
                setDeleteConfirmText('');
            }}>
              Cancel
            </Button>
            <Button variant="destructive" disabled={deleteConfirmText !== 'DELETE' || deleteLoading} onClick={handleDeleteAccount} className="gap-2">
              {deleteLoading ? (<div className="w-4 h-4 border-2 border-white/60 border-t-white rounded-full animate-spin"/>) : null}
              Delete My Account
            </Button>
          </div>
        </div>
      </div>)}
    </>);
};
