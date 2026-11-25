import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import type { Address } from '../../types/database';
import toast from 'react-hot-toast';
import {
  User,
  Mail,
  Phone,
  Save,
  Loader2,
  Lock,
  Eye,
  EyeOff,
  MapPin,
  Plus,
  Trash2,
  CheckCircle2,
  Edit2,
  X,
  Home,
  Check,
  Building,
} from 'lucide-react';

export default function CustomerProfile() {
  const { user, profile, refreshProfile } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'password' | 'addresses'>('profile');

  // ── Profile form state ──
  const [profileForm, setProfileForm] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // Sync profile form when profile changes
  useEffect(() => {
    if (profile) {
      setProfileForm({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
      });
    }
  }, [profile]);

  // ── Password change state ──
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // ── Addresses state ──
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [addressForm, setAddressForm] = useState({
    full_name: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    state: 'Rajasthan',
    postal_code: '',
    country: 'India',
    is_default: false,
  });

  // Fetch addresses
  const fetchAddresses = async () => {
    if (!user) return;
    setLoadingAddresses(true);
    try {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAddresses(data || []);
    } catch (err: any) {
      console.error('Error fetching addresses:', err);
    } finally {
      setLoadingAddresses(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, [user]);

  // ── 1. Save Profile Details ──
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSavingProfile(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profileForm.full_name.trim(),
          phone: profileForm.phone.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      await refreshProfile();
      toast.success('Profile details updated successfully!');
    } catch (err: any) {
      toast.error('Failed to update profile: ' + err.message);
    } finally {
      setSavingProfile(false);
    }
  };

  // ── 2. Update Password ──
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.email) return;

    const { currentPassword, newPassword, confirmPassword } = passwordForm;

    if (!currentPassword) {
      toast.error('Please enter your current password.');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New password and confirm password do not match.');
      return;
    }

    setSavingPassword(true);
    try {
      // Step A: Re-authenticate with current password to verify identity
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (signInError) {
        toast.error('Incorrect current password. Please try again.');
        setSavingPassword(false);
        return;
      }

      // Step B: Update password in Supabase Auth
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;

      toast.success('Password changed successfully! Keep your new password secure.');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err: any) {
      toast.error(err.message || 'Failed to update password.');
    } finally {
      setSavingPassword(false);
    }
  };

  // ── 3. Address Management ──
  const openAddAddressModal = () => {
    setEditingAddress(null);
    setAddressForm({
      full_name: profile?.full_name || '',
      phone: profile?.phone || '',
      line1: '',
      line2: '',
      city: '',
      state: 'Rajasthan',
      postal_code: '',
      country: 'India',
      is_default: addresses.length === 0,
    });
    setIsAddingAddress(true);
  };

  const openEditAddressModal = (addr: Address) => {
    setEditingAddress(addr);
    setAddressForm({
      full_name: addr.full_name,
      phone: addr.phone,
      line1: addr.line1,
      line2: addr.line2 || '',
      city: addr.city,
      state: addr.state,
      postal_code: addr.postal_code,
      country: addr.country,
      is_default: addr.is_default,
    });
    setIsAddingAddress(true);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!addressForm.full_name.trim() || !addressForm.phone.trim() || !addressForm.line1.trim() || !addressForm.city.trim() || !addressForm.postal_code.trim()) {
      toast.error('Please fill in all required address fields.');
      return;
    }

    setSavingAddress(true);
    try {
      // If this address is set as default, remove default flag from others
      if (addressForm.is_default) {
        await supabase
          .from('addresses')
          .update({ is_default: false })
          .eq('user_id', user.id);
      }

      if (editingAddress) {
        // Update existing address
        const { error } = await supabase
          .from('addresses')
          .update({
            full_name: addressForm.full_name.trim(),
            phone: addressForm.phone.trim(),
            line1: addressForm.line1.trim(),
            line2: addressForm.line2.trim() || null,
            city: addressForm.city.trim(),
            state: addressForm.state.trim(),
            postal_code: addressForm.postal_code.trim(),
            country: addressForm.country.trim(),
            is_default: addressForm.is_default,
          })
          .eq('id', editingAddress.id);

        if (error) throw error;
        toast.success('Address updated successfully!');
      } else {
        // Insert new address
        const { error } = await supabase.from('addresses').insert({
          user_id: user.id,
          full_name: addressForm.full_name.trim(),
          phone: addressForm.phone.trim(),
          line1: addressForm.line1.trim(),
          line2: addressForm.line2.trim() || null,
          city: addressForm.city.trim(),
          state: addressForm.state.trim(),
          postal_code: addressForm.postal_code.trim(),
          country: addressForm.country.trim(),
          is_default: addressForm.is_default || addresses.length === 0,
        });

        if (error) throw error;
        toast.success('New delivery address saved!');
      }

      setIsAddingAddress(false);
      setEditingAddress(null);
      await fetchAddresses();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save address.');
    } finally {
      setSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    try {
      const { error } = await supabase.from('addresses').delete().eq('id', id);
      if (error) throw error;
      toast.success('Address removed.');
      await fetchAddresses();
    } catch (err: any) {
      toast.error('Failed to delete address: ' + err.message);
    }
  };

  const handleSetDefaultAddress = async (id: string) => {
    if (!user) return;
    try {
      await supabase.from('addresses').update({ is_default: false }).eq('user_id', user.id);
      await supabase.from('addresses').update({ is_default: true }).eq('id', id);
      toast.success('Default delivery address updated.');
      await fetchAddresses();
    } catch (err: any) {
      toast.error('Failed to set default: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub Tabs Selector */}
      <div className="bg-white rounded-3xl border border-gray-100 p-2 shadow-xs">
        <div className="grid grid-cols-3 gap-1">
          <button
            type="button"
            onClick={() => setActiveSubTab('profile')}
            className={`py-3 px-3 sm:px-4 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 ${
              activeSubTab === 'profile'
                ? 'bg-henna-600 text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile Details</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('password')}
            className={`py-3 px-3 sm:px-4 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 ${
              activeSubTab === 'password'
                ? 'bg-henna-600 text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Change Password</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('addresses')}
            className={`py-3 px-3 sm:px-4 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 ${
              activeSubTab === 'addresses'
                ? 'bg-henna-600 text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Delivery Addresses ({addresses.length})</span>
          </button>
        </div>
      </div>

      {/* ─── TAB 1: PERSONAL PROFILE ─── */}
      {activeSubTab === 'profile' && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xs p-6 sm:p-8 space-y-6 animate-fade-in">
          <div className="border-b border-gray-100 pb-4 flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl font-bold text-gray-900">
                Personal Information
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Manage your name and phone number used for dispatches and order updates
              </p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-henna-50 border border-henna-200 text-henna-700 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-5 max-w-lg">
            <div>
              <label className="label">Registered Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="input pl-10 bg-gray-50 text-gray-500 cursor-not-allowed font-medium text-xs sm:text-sm"
                />
              </div>
              <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Verified primary account email</span>
              </p>
            </div>

            <div>
              <label className="label">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  required
                  value={profileForm.full_name}
                  onChange={(e) => setProfileForm((p) => ({ ...p, full_name: e.target.value }))}
                  placeholder="Your full name"
                  className="input pl-10 text-xs sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label className="label">Phone / WhatsApp Number</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))}
                  placeholder="+91 98765 43210"
                  className="input pl-10 text-xs sm:text-sm"
                />
              </div>
              <p className="text-[11px] text-gray-400 mt-1">Used by courier partners for dispatch status &amp; delivery verification</p>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={savingProfile}
                className="btn-primary text-xs px-6 py-3 rounded-xl shadow-sm hover:shadow flex items-center gap-2"
              >
                {savingProfile ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Profile Details</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ─── TAB 2: CHANGE PASSWORD ─── */}
      {activeSubTab === 'password' && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xs p-6 sm:p-8 space-y-6 animate-fade-in">
          <div className="border-b border-gray-100 pb-4 flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl font-bold text-gray-900">
                Security &amp; Password Update
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Verify your current credentials and set a new password for your account
              </p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-henna-50 border border-henna-200 text-henna-700 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-5 max-w-lg">
            {/* Current Password */}
            <div>
              <label className="label">Current Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  required
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))}
                  placeholder="Enter current password"
                  className="input pl-10 pr-10 text-xs sm:text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword((prev) => !prev)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-hidden"
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="label">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))}
                  placeholder="Enter new password (min. 6 chars)"
                  className="input pl-10 pr-10 text-xs sm:text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-hidden"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-gray-400 mt-1">Must be at least 6 characters long</p>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="label">Confirm New Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                  placeholder="Re-enter new password"
                  className="input pl-10 pr-10 text-xs sm:text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-hidden"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={savingPassword}
                className="btn-primary text-xs px-6 py-3 rounded-xl shadow-sm hover:shadow flex items-center gap-2"
              >
                {savingPassword ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying &amp; Updating...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Update Password</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ─── TAB 3: SAVED DELIVERY ADDRESSES ─── */}
      {activeSubTab === 'addresses' && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xs p-6 sm:p-8 space-y-6 animate-fade-in">
          <div className="border-b border-gray-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-xl font-bold text-gray-900">
                Delivery Addresses
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Save shipping addresses for quick one-click checkout and invoice generation
              </p>
            </div>
            {!isAddingAddress && (
              <button
                type="button"
                onClick={openAddAddressModal}
                className="btn-primary text-xs px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-2 self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Address</span>
              </button>
            )}
          </div>

          {/* Inline Add / Edit Address Form */}
          {isAddingAddress && (
            <div className="p-6 rounded-2xl bg-henna-50/50 border-2 border-henna-200 space-y-5 animate-slide-in">
              <div className="flex items-center justify-between border-b border-henna-200/60 pb-3">
                <h3 className="font-display font-bold text-sm text-henna-950 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-henna-700" />
                  <span>{editingAddress ? 'Edit Delivery Address' : 'Add New Delivery Address'}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsAddingAddress(false)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveAddress} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Contact Name *</label>
                    <input
                      type="text"
                      required
                      value={addressForm.full_name}
                      onChange={(e) => setAddressForm((p) => ({ ...p, full_name: e.target.value }))}
                      placeholder="Receiver's name"
                      className="input text-xs"
                    />
                  </div>
                  <div>
                    <label className="label">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={addressForm.phone}
                      onChange={(e) => setAddressForm((p) => ({ ...p, phone: e.target.value }))}
                      placeholder="+91 98765 43210"
                      className="input text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Address Line 1 (House No., Building, Street) *</label>
                  <input
                    type="text"
                    required
                    value={addressForm.line1}
                    onChange={(e) => setAddressForm((p) => ({ ...p, line1: e.target.value }))}
                    placeholder="e.g. Plot No. 42, Industrial Area, Phase 3"
                    className="input text-xs"
                  />
                </div>

                <div>
                  <label className="label">Address Line 2 (Area, Landmark)</label>
                  <input
                    type="text"
                    value={addressForm.line2}
                    onChange={(e) => setAddressForm((p) => ({ ...p, line2: e.target.value }))}
                    placeholder="Near City Bus Stand, Opposite Petrol Pump"
                    className="input text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="label">City *</label>
                    <input
                      type="text"
                      required
                      value={addressForm.city}
                      onChange={(e) => setAddressForm((p) => ({ ...p, city: e.target.value }))}
                      placeholder="Sojat City"
                      className="input text-xs"
                    />
                  </div>
                  <div>
                    <label className="label">State *</label>
                    <input
                      type="text"
                      required
                      value={addressForm.state}
                      onChange={(e) => setAddressForm((p) => ({ ...p, state: e.target.value }))}
                      placeholder="Rajasthan"
                      className="input text-xs"
                    />
                  </div>
                  <div>
                    <label className="label">PIN Code *</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={addressForm.postal_code}
                      onChange={(e) => setAddressForm((p) => ({ ...p, postal_code: e.target.value }))}
                      placeholder="306104"
                      className="input text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="label">Country</label>
                    <input
                      type="text"
                      disabled
                      value={addressForm.country}
                      className="input text-xs bg-gray-100 text-gray-500"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="is_default_checkbox"
                    checked={addressForm.is_default}
                    onChange={(e) => setAddressForm((p) => ({ ...p, is_default: e.target.checked }))}
                    className="w-4 h-4 rounded-sm text-henna-600 focus:ring-henna-500 border-gray-300"
                  />
                  <label htmlFor="is_default_checkbox" className="text-xs font-semibold text-gray-700 cursor-pointer">
                    Set this as my default shipping address for checkout
                  </label>
                </div>

                <div className="flex items-center gap-3 pt-3">
                  <button
                    type="submit"
                    disabled={savingAddress}
                    className="btn-primary text-xs px-5 py-2.5 rounded-xl shadow-xs flex items-center gap-2"
                  >
                    {savingAddress ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    <span>{editingAddress ? 'Save Changes' : 'Save Address'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingAddress(false)}
                    className="btn-secondary text-xs px-4 py-2.5 rounded-xl"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* List of saved addresses */}
          {loadingAddresses ? (
            <div className="py-12 flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-henna-600" />
            </div>
          ) : addresses.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-2xl border-2 border-dashed border-gray-200">
              <Building className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-bold text-gray-800">No saved addresses found</p>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                Add your home, office, or factory address to expedite your orders and delivery tracking.
              </p>
              <button
                type="button"
                onClick={openAddAddressModal}
                className="btn-primary text-xs px-4 py-2 rounded-xl mt-4 inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Your First Address</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    addr.is_default
                      ? 'border-henna-500 bg-henna-50/20 shadow-xs ring-1 ring-henna-400/30'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-gray-900">{addr.full_name}</span>
                      {addr.is_default && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-henna-100 text-henna-800 uppercase tracking-wide">
                          <CheckCircle2 className="w-3 h-3 text-henna-700" />
                          Default
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEditAddressModal(addr)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-henna-700 hover:bg-henna-50 transition"
                        title="Edit address"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                        title="Delete address"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 leading-relaxed">
                    {addr.line1}
                    {addr.line2 && <>, {addr.line2}</>}
                    <br />
                    {addr.city}, {addr.state} — <span className="font-mono font-semibold">{addr.postal_code}</span>
                    <br />
                    {addr.country}
                  </p>

                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                    <span className="text-gray-500 font-medium">📞 {addr.phone}</span>
                    {!addr.is_default && (
                      <button
                        type="button"
                        onClick={() => handleSetDefaultAddress(addr.id)}
                        className="text-[11px] font-semibold text-henna-700 hover:underline"
                      >
                        Set as Default
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}