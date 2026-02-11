'use client';

import { useState } from 'react';
import { X, Mail, Phone, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';

type AuthStep = 'method' | 'email' | 'phone' | 'verify-email' | 'verify-phone';

export function AuthModal() {
  const { isAuthModalOpen, setAuthModalOpen } = useStore();
  const { sendMagicLink, sendOTP, verifyOTP, isLoading } = useAuth();
  const [step, setStep] = useState<AuthStep>('method');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');

  if (!isAuthModalOpen) return null;

  const handleSendMagicLink = async () => {
    setError('');
    const result = await sendMagicLink(email);
    if (result.success) {
      setStep('verify-email');
    } else {
      setError(result.error || 'Failed to send email');
    }
  };

  const handleSendOTP = async () => {
    setError('');
    // Ensure phone has + prefix
    const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;
    const result = await sendOTP(formattedPhone);
    if (result.success) {
      setPhone(formattedPhone);
      setStep('verify-phone');
    } else {
      setError(result.error || 'Failed to send code');
    }
  };

  const handleVerifyOTP = async () => {
    setError('');
    const result = await verifyOTP(phone, otp);
    if (result.success) {
      handleClose();
    } else {
      setError(result.error || 'Invalid code');
    }
  };

  const handleClose = () => {
    setAuthModalOpen(false);
    // Reset form after animation
    setTimeout(() => {
      setStep('method');
      setEmail('');
      setPhone('');
      setOtp('');
      setError('');
    }, 200);
  };

  const handleBack = () => {
    setError('');
    setStep('method');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 pb-0 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {step !== 'method' && (
              <button
                onClick={handleBack}
                className="p-2 -ml-2 text-muted hover:text-foreground rounded-lg hover:bg-background transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <h2 className="text-xl font-semibold">
                {step === 'method' && 'Sign in to Metrix'}
                {step === 'email' && 'Enter your email'}
                {step === 'phone' && 'Enter your phone'}
                {step === 'verify-email' && 'Check your email'}
                {step === 'verify-phone' && 'Enter verification code'}
              </h2>
              <p className="text-sm text-muted mt-1">
                {step === 'method' && 'Choose how you want to sign in'}
                {step === 'email' && "We'll send you a magic link"}
                {step === 'phone' && "We'll send you a verification code"}
                {step === 'verify-email' && 'Click the link we sent you'}
                {step === 'verify-phone' && 'Enter the 6-digit code'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-muted hover:text-foreground rounded-lg hover:bg-background transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Method Selection */}
          {step === 'method' && (
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start h-14 text-left"
                onClick={() => setStep('email')}
              >
                <Mail className="w-5 h-5 mr-3 text-primary" />
                <div>
                  <div className="font-medium">Continue with Email</div>
                  <div className="text-xs text-muted">We&apos;ll send you a magic link</div>
                </div>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start h-14 text-left"
                onClick={() => setStep('phone')}
              >
                <Phone className="w-5 h-5 mr-3 text-primary" />
                <div>
                  <div className="font-medium">Continue with Phone</div>
                  <div className="text-xs text-muted">We&apos;ll send you a code via SMS</div>
                </div>
              </Button>
            </div>
          )}

          {/* Email Input */}
          {step === 'email' && (
            <div className="space-y-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && email && handleSendMagicLink()}
              />
              <Button
                className="w-full"
                onClick={handleSendMagicLink}
                disabled={isLoading || !email || !email.includes('@')}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Mail className="w-4 h-4 mr-2" />
                )}
                Send Magic Link
              </Button>
            </div>
          )}

          {/* Phone Input */}
          {step === 'phone' && (
            <div className="space-y-4">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/[^\d+]/g, ''))}
                placeholder="+1 555 000 0000"
                className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && phone && handleSendOTP()}
              />
              <p className="text-xs text-muted">
                Enter your phone number with country code (e.g., +1 for US)
              </p>
              <Button
                className="w-full"
                onClick={handleSendOTP}
                disabled={isLoading || phone.length < 10}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Phone className="w-4 h-4 mr-2" />
                )}
                Send Code
              </Button>
            </div>
          )}

          {/* Email Verification Pending */}
          {step === 'verify-email' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <Mail className="w-8 h-8 text-primary" />
              </div>
              <p className="text-muted">We sent a magic link to</p>
              <p className="font-medium text-lg">{email}</p>
              <p className="text-sm text-muted mt-4">
                Click the link in the email to sign in.<br />
                The link expires in 15 minutes.
              </p>
              <Button
                variant="ghost"
                className="mt-6"
                onClick={() => setStep('email')}
              >
                Use a different email
              </Button>
            </div>
          )}

          {/* OTP Input */}
          {step === 'verify-phone' && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <p className="text-muted text-sm">Enter the code sent to</p>
                <p className="font-medium">{phone}</p>
              </div>
              <input
                type="text"
                inputMode="numeric"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                className="w-full px-4 py-4 bg-background border border-border rounded-lg text-center text-2xl tracking-[0.5em] font-mono focus:outline-none focus:ring-2 focus:ring-primary/50"
                autoFocus
                maxLength={6}
                onKeyDown={(e) => e.key === 'Enter' && otp.length === 6 && handleVerifyOTP()}
              />
              <Button
                className="w-full"
                onClick={handleVerifyOTP}
                disabled={isLoading || otp.length !== 6}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <CheckCircle className="w-4 h-4 mr-2" />
                )}
                Verify Code
              </Button>
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setOtp('');
                  handleSendOTP();
                }}
                disabled={isLoading}
              >
                Resend code
              </Button>
            </div>
          )}
        </div>

        {/* Footer - Terms */}
        <div className="px-6 pb-6 text-center">
          <p className="text-xs text-muted">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
